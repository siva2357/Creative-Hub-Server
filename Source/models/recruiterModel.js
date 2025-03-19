const mongoose = require('mongoose');

const recruiterSchema = mongoose.Schema({
    registrationDetails: {
        email: { type: String, required: [true, 'Email is required'], trim: true, unique: [true, 'Email must be unique!'], minLength: [5, "Email must have 5 characters!"], lowercase: true },
        password: { type: String, required: [true, "Password is required"], trim: true, select: false },
        verified: { type: Boolean, default: false },
        verificationCode: { type: String, select: false },
        verificationCodeValidation: { type: Number, select: false },
        forgotPasswordCode: { type: String, select: false },
        forgotPasswordCodeValidation: { type: Number, select: false }
    },
    role: { type: String, default: 'recruiter' },
    lastLoginAt: { type: Date },  // Store last login time
    lastLogoutAt: { type: Date }, // Store last logout time
    status: { type: String, enum: ["active", "inactive"], default: "inactive" } // Track user status
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);
