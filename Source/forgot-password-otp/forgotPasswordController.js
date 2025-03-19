const joi = require('joi');
const seeker = require('../models/seekerModel');
const recruiter = require('../models/recruiterModel');
const transport = require("../middleware/sendMail");
const { hmacProcess } = require("../utils/hashing");
const bcrypt = require('bcryptjs');

// ✅ Validation schema for OTP and email
exports.acceptFpCodeSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({ tlds: { allow: ['com', 'net'] } }),
    providedCode: joi.number().required(),
});

exports.acceptFpSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({ tlds: { allow: ['com', 'net'] } }),
    newPassword: joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')),
});

// ✅ Step 1: Send Forgot Password OTP
exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;

    try {
        // 🔍 Check if email exists in either Seeker or Recruiter collection
        const seekerUser = await seeker.findOne({ 'registrationDetails.email': email });
        const recruiterUser = await recruiter.findOne({ 'registrationDetails.email': email });

        if (!seekerUser && !recruiterUser) {
            return res.status(404).json({ success: false, message: "User with this email does not exist!" });
        }

        const existingUser = seekerUser || recruiterUser;
        const userRole = seekerUser ? 'Seeker' : 'Recruiter';
        console.log(`Role of user with email ${email}: ${userRole}`);

        // 🔑 Generate OTP
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        // 📧 Send OTP via email
        await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.registrationDetails.email,
            subject: "Verification Code for resetting password",
            html: `<h1>Your OTP for resetting password: ${codeValue}</h1>`,
        });

        // ✅ Save OTP in user record with timestamp
        existingUser.registrationDetails.forgotPasswordCode = hashedCodeValue;
        existingUser.registrationDetails.forgotPasswordCodeValidation = Date.now();
        await existingUser.save();

        res.status(200).json({ success: true, message: `OTP has been sent to ${email}. Please check your inbox.` });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "An error occurred while sending the OTP. Please try again." });
    }
};

// ✅ Step 2: Verify OTP
exports.verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode } = req.body;

    try {
        // 🔍 Find user with email
        const seekerUser = await seeker.findOne({ 'registrationDetails.email': email }).select("+registrationDetails.forgotPasswordCode +registrationDetails.forgotPasswordCodeValidation");
        const recruiterUser = await recruiter.findOne({ 'registrationDetails.email': email }).select("+registrationDetails.forgotPasswordCode +registrationDetails.forgotPasswordCodeValidation");

        if (!seekerUser && !recruiterUser) {
            return res.status(404).json({ success: false, message: "User with this email does not exist!" });
        }

        const existingUser = seekerUser || recruiterUser;

        // ❌ Check if OTP exists and hasn't expired (5-minute window)
        if (!existingUser.registrationDetails.forgotPasswordCode || !existingUser.registrationDetails.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: "No verification code found!" });
        }

        if (Date.now() - existingUser.registrationDetails.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "OTP expired!" });
        }




        // 🔑 Verify OTP
        const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);

        if (hashedCodeValue === existingUser.registrationDetails.forgotPasswordCode) {
            // ✅ Clear OTP after successful verification
            existingUser.registrationDetails.forgotPasswordCode = undefined;
            existingUser.registrationDetails.forgotPasswordCodeValidation = undefined;
            await existingUser.save();

            return res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
        }

        return res.status(400).json({ success: false, message: "Invalid OTP!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Error verifying OTP." });
    }
};

// ✅ Step 3: Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const seekerUser = await seeker.findOne({ 'registrationDetails.email': email });
        const recruiterUser = await recruiter.findOne({ 'registrationDetails.email': email });

        if (!seekerUser && !recruiterUser) {
            return res.status(404).json({ success: false, message: "User with this email does not exist!" });
        }

        const existingUser = seekerUser || recruiterUser;

        // Password validation (8+ characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character." });
        }

        // Hash new password using doHash function


                const saltRounds = 12;
                const salt = await bcrypt.genSalt(saltRounds);  // ✅ Generate a valid salt
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                existingUser.registrationDetails.password = hashedPassword;

        // Clear OTP fields
        existingUser.registrationDetails.forgotPasswordCode = undefined;
        existingUser.registrationDetails.forgotPasswordCodeValidation = undefined;
        await existingUser.save();

        return res.status(200).json({ success: true, message: "Password reset successful. You can now log in with your new password." });

    } catch (error) {
        console.error("Password Reset Error:", error);
        res.status(500).json({ success: false, message: "Error resetting password." });
    }
};

