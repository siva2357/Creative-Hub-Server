const joi = require('joi');
const seeker = require('../models/seekerModel');
const recruiter = require('../models/recruiterModel');
const transport = require("../middleware/sendMail");
const { hmacProcess } = require("../utils/hashing");

// Validation schema for OTP and email
exports.acceptCodeSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    providedCode: joi.number().required(),
    
})

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;  // Only need email to send OTP

    try {
        // Check if email exists in either Seeker or Recruiter collection
        const seekerUser = await seeker.findOne({ 'registrationDetails.email': email });
        const recruiterUser = await recruiter.findOne({ 'registrationDetails.email': email });

        if (!seekerUser && !recruiterUser) {
            return res.status(404).json({ success: false, message: "User with this email does not exist!" });
        }

        // Choose the user model based on which collection the email is found in
        const existingUser = seekerUser || recruiterUser;
        const userRole = seekerUser ? 'Seeker' : 'Recruiter';
        console.log(`Role of user with email ${email}: ${userRole}`);

        // Generate OTP
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        // Send OTP via email
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: email,
            subject: "verfication code to verify your account",
            html: `<h1>Your OTP for account verification: ${codeValue}</h1>`
        });

        if (info.accepted[0] === email) {
            // Save OTP in the user record with a timestamp
            existingUser.registrationDetails.verificationCode = hashedCodeValue;
            existingUser.registrationDetails.verificationCodeValidation = Date.now();
            await existingUser.save();
        }

        res.status(200).json({ success: true, message: `OTP has been sent to ${email}. Please check your inbox.` });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "An error occurred while sending the OTP. Please try again." });
    }
};

exports.verifyCode = async (req, res) => {
    // Validate the request body using the acceptCodeSchema
    const { error } = exports.acceptCodeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, providedCode } = req.body;

    try {
        // Check if the email exists in either Seeker or Recruiter collection
        const seekerUser = await seeker.findOne({ 'registrationDetails.email': email }).select("+registrationDetails.verificationCode +registrationDetails.verificationCodeValidation");
        const recruiterUser = await recruiter.findOne({ 'registrationDetails.email': email }).select("+registrationDetails.verificationCode +registrationDetails.verificationCodeValidation");

        if (!seekerUser && !recruiterUser) {
            return res.status(404).json({ success: false, message: "User with this email does not exist!" });
        }

        // Choose the user model based on which collection the email is found in
        const existingUser = seekerUser || recruiterUser;
        const userRole = seekerUser ? 'Seeker' : 'Recruiter';

        // Check if the code exists and is not expired
        if (!existingUser.registrationDetails.verificationCode || !existingUser.registrationDetails.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "No verification code found!" });
        }

        // Check if the code has expired (5 minutes window)
        if (Date.now() - existingUser.registrationDetails.verificationCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "Verification code has expired!" });
        }

        // Hash the provided code and compare with stored code
        const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);

        if (hashedCodeValue === existingUser.registrationDetails.verificationCode) {
            existingUser.registrationDetails.verified = true;
            existingUser.registrationDetails.verificationCode = undefined;
            existingUser.registrationDetails.verificationCodeValidation = undefined;
            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: "User account has been verified successfully.",
                role: userRole  // Return only the role (Seeker or Recruiter)
            });
        }

        return res.status(400).json({ success: false, message: "Invalid verification code!" });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Internal server error during code verification." });
    }
};

