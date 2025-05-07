// controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

// --- Helper Function to Generate JWT ---
const generateToken = (payload, secret, expiresIn) => {
    const effectiveSecret = secret || process.env.JWT_SECRET;
    const effectiveExpiresIn = expiresIn || process.env.JWT_EXPIRE || '1h';
    if (!effectiveSecret) {
        console.error("FATAL ERROR: JWT_SECRET is not defined!");
        // Throw an error in a real application instead of returning null
        throw new ErrorResponse('JWT configuration error.', 500);
    }
    return jwt.sign(payload, effectiveSecret, { expiresIn: effectiveExpiresIn });
};

// --- Helper function to send token response ---
// *** MODIFIED to include loggedIn: true ***
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    // Create token
    const payload = { user: { id: user.id, role: user.role } };
    const token = generateToken(payload);

    if (!token) {
        // This should ideally not happen if generateToken throws, but as a safeguard
        throw new ErrorResponse('Could not generate session token.', 500);
    }

    const options = {
        // Set expiry based on JWT_COOKIE_EXPIRE env var (e.g., '30d')
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE_DAYS || '30', 10) * 24 * 60 * 60 * 1000),
        httpOnly: true // Cookie can't be accessed by client-side scripts
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true; // Only send cookie over HTTPS in production
    }

    // Prepare user data for response (remove sensitive fields)
    const userResponse = { ...user._doc }; // Use ._doc to get plain object if user is a Mongoose doc
    delete userResponse.password;
    delete userResponse.__v;
    // delete userResponse.resetPasswordToken; // etc.

    res.status(statusCode)
       .cookie('token', token, options) // Optional: send token via cookie
       .json({
           success: true,
           loggedIn: true, // *** ADDED THIS FLAG for login scenarios ***
           message: message,
           token, // Send token in response body as well
           user: userResponse
       });
};


// --- Controller Functions ---

/**
 * @desc    Register user (Standard email/password)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
        return next(new ErrorResponse('Please provide name, email, phone, and password.', 400));
    }

    // Check if user already exists (by email or phone)
    let existingUser = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
    if (existingUser) {
        const conflictField = existingUser.email === email ? 'Email' : 'Phone number';
        return next(new ErrorResponse(`${conflictField} already exists`, 400));
    }

    // Create user (password hashing is handled by pre-save hook in User model)
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: role || 'user'
    });

    // Use helper to send token and user data
    sendTokenResponse(user, 201, res, 'User registered successfully'); // This will now send loggedIn: true
});


/**
 * @desc    Login user (Standard email/password)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Find user by email and explicitly include password and role
    const user = await User.findOne({ email }).select('+password +role');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401)); // Use 401 for auth errors
    }

    // Check if password matches (using method from User model)
    // Ensure User model has matchPassword method
    if (!user.matchPassword) {
         console.error(`User model is missing matchPassword method for user ${user.email}`);
         return next(new ErrorResponse('Server configuration error', 500));
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Use helper to send token and user data
    sendTokenResponse(user, 200, res, 'Login successful'); // This will now send loggedIn: true
});

/**
 * @desc    Login admin user
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
exports.adminLoginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password +role');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials or unauthorized', 401));
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
        return next(new ErrorResponse('Access denied: User is not an admin', 403)); // 403 Forbidden
    }

    // Ensure User model has matchPassword method
    if (!user.matchPassword) {
         console.error(`User model is missing matchPassword method for user ${user.email}`);
         return next(new ErrorResponse('Server configuration error', 500));
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials or unauthorized', 401));
    }

    sendTokenResponse(user, 200, res, 'Admin login successful'); // This will now send loggedIn: true
});


/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is set by the 'protect' middleware
    // Fetch user again to ensure latest data, exclude password implicitly
    const user = await User.findById(req.user.id);

    if (!user) {
        // Should not happen if protect middleware works, but good practice
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});


/**
 * @desc    Update user details (name, email, phone)
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { name, email, phone } = req.body;
    const fieldsToUpdate = {};

    // Build object with fields that were actually provided
    if (name !== undefined) fieldsToUpdate.name = name.trim();
    if (email !== undefined) fieldsToUpdate.email = email.trim().toLowerCase();
    if (phone !== undefined) fieldsToUpdate.phone = phone.trim();

    // Check if there's anything to update
    if (Object.keys(fieldsToUpdate).length === 0) {
        return next(new ErrorResponse('Please provide details to update (name, email, or phone)', 400));
    }

    // Check for uniqueness if email or phone are being updated
    if (fieldsToUpdate.email || fieldsToUpdate.phone) {
        const checkQuery = [];
        if (fieldsToUpdate.email) checkQuery.push({ email: fieldsToUpdate.email });
        if (fieldsToUpdate.phone) checkQuery.push({ phone: fieldsToUpdate.phone });

        const existingUser = await User.findOne({
            $or: checkQuery,
            _id: { $ne: req.user.id } // Exclude the current user
        });

        if (existingUser) {
            const conflictField = existingUser.email === fieldsToUpdate.email ? 'Email' : 'Phone number';
            return next(new ErrorResponse(`${conflictField} already in use by another account.`, 400));
        }
    }


    console.log(`[updateDetails] Updating fields for user ${req.user.id}:`, fieldsToUpdate);

    // Find user and update
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true, // Return the updated document
        runValidators: true // Run schema validators on update
    });

    if (!user) {
        return next(new ErrorResponse('User not found during update', 404));
    }

    console.log(`[updateDetails] User ${req.user.id} updated successfully.`);

    // Send back updated user data (password is excluded by default schema select)
    res.status(200).json({
        success: true,
        data: user
    });
});


/**
 * @desc    Update user password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorResponse('Please provide current and new password', 400));
    }
    if (newPassword.length < 6) {
         return next(new ErrorResponse('New password must be at least 6 characters long', 400));
    }
    if (currentPassword === newPassword) {
        return next(new ErrorResponse('New password cannot be the same as the current password', 400));
    }

    console.log(`[updatePassword] Attempting password update for user ${req.user.id}`);

    // Find user and explicitly select the password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Ensure User model has matchPassword method
    if (!user.matchPassword) {
         console.error(`User model is missing matchPassword method for user ${user._id}`);
         return next(new ErrorResponse('Server configuration error', 500));
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        console.log(`[updatePassword] Incorrect current password for user ${req.user.id}`);
        return next(new ErrorResponse('Incorrect current password', 401));
    }

    // Update password (Mongoose pre-save hook handles hashing)
    user.password = newPassword;
    await user.save();

    console.log(`[updatePassword] Password updated successfully for user ${req.user.id}`);

    // Send success response. Optionally send a new token if desired.
    // sendTokenResponse(user, 200, res, 'Password updated successfully'); // Example if sending token
     res.status(200).json({ success: true, message: 'Password updated successfully' });
});


/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOtp = asyncHandler(async (req, res, next) => {
    const { phone } = req.body;
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
        return next(new ErrorResponse('Valid phone number is required.', 400));
    }
    const formattedPhone = phone.replace(/\s/g, '');

    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Upsert: Update existing OTP record for the phone or create a new one
    await Otp.findOneAndUpdate(
        { phoneNumber: formattedPhone },
        { hashedOtp: otpHash, expiresAt: expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // *** TODO: Integrate actual SMS sending logic here ***
    // Example: await sendSms(formattedPhone, `Your Safartak OTP is: ${otp}`);
    console.log(`---> OTP for ${formattedPhone}: ${otp} (Expires: ${expiresAt.toLocaleTimeString()}) <---`); // For testing

    res.status(200).json({ success: true, message: 'OTP sent successfully (logged for now).' });
});


/**
 * @desc    Verify OTP and login/initiate registration
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOtp = asyncHandler(async (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return next(new ErrorResponse('Phone number and OTP are required.', 400));
    }
    if (!/^\d{6}$/.test(otp)) {
        return next(new ErrorResponse('Invalid OTP format. Must be 6 digits.', 400));
    }
    const formattedPhone = phone.replace(/\s/g, '');

    // Find and validate the OTP record
    const otpRecord = await Otp.findOne({ phoneNumber: formattedPhone });

    if (!otpRecord) {
        return next(new ErrorResponse('Invalid OTP or OTP request expired. Please request a new OTP.', 400));
    }
    if (otpRecord.expiresAt < new Date()) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return next(new ErrorResponse('OTP has expired. Please request a new one.', 400));
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid OTP.', 400));
    }

    // OTP is valid, delete it
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check if user exists
    const existingUser = await User.findOne({ phone: formattedPhone });

    if (existingUser) {
        // User EXISTS: Log them in using sendTokenResponse helper
        console.log(`Existing user logged in via OTP: ${formattedPhone}`);
        sendTokenResponse(existingUser, 200, res, 'Login successful.'); // *** This NOW sends loggedIn: true ***
    } else {
        // User DOES NOT EXIST: Initiate registration completion
        console.log(`New phone number verified via OTP: ${formattedPhone}. Details needed.`);
        const registrationPayload = { phone: formattedPhone, purpose: 'complete-registration' };
        const registrationToken = generateToken(registrationPayload, process.env.JWT_SECRET, '10m'); // Short expiry

        res.status(200).json({
            success: true,
            loggedIn: false, // Explicitly false for this case
            needsDetails: true,
            phone: formattedPhone,
            registrationToken: registrationToken
        });
    }
});


/**
 * @desc    Complete user registration after OTP verification
 * @route   POST /api/auth/complete-registration
 * @access  Public (requires valid registrationToken)
 */
exports.completeRegistration = asyncHandler(async (req, res, next) => {
    const { registrationToken, name, email } = req.body;

    if (!registrationToken || !name || name.trim() === '') {
        return next(new ErrorResponse('Registration token and name are required.', 400));
    }
    if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return next(new ErrorResponse('Please provide a valid email address.', 400));
    }

    // Verify the registrationToken
    let decoded;
    try {
        decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    } catch (err) {
        return next(new ErrorResponse('Invalid or expired registration session. Please start over.', 401));
    }

    if (decoded.purpose !== 'complete-registration' || !decoded.phone) {
        return next(new ErrorResponse('Invalid registration token purpose or content.', 401));
    }

    const phone = decoded.phone;

    // Check if user already exists (race condition check)
    const checkQuery = [{ phone: phone }];
    if (email && email.trim() !== '') {
        checkQuery.push({ email: email.trim().toLowerCase() });
    }
    let existingUser = await User.findOne({ $or: checkQuery });

    if (existingUser) {
        const conflictField = existingUser.phone === phone ? 'Phone number' : 'Email';
        return next(new ErrorResponse(`${conflictField} is already associated with an account.`, 409));
    }

    // Create the new user (password is not set)
    const user = await User.create({
        name: name.trim(),
        phone: phone,
        email: (email && email.trim() !== '') ? email.trim().toLowerCase() : undefined,
        role: 'user'
    });

    console.log(`New user fully registered: ${phone}`);

    // Login the new user immediately using sendTokenResponse helper
    sendTokenResponse(user, 201, res, 'Registration successful!'); // This will now send loggedIn: true
});


// --- Get All Users (Admin) ---
/**
 * @desc    Get all users
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    // Assuming 'authorize' middleware checks for 'admin' role
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});
