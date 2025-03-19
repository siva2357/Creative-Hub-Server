const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    registrationDetails: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        userName: { type: String, required: true, trim: true },
        email: { type: String, required: [true, 'Email is required'], trim: true, unique: true, minLength: [5, "Email must have 5 characters!"], lowercase: true },
        password: { type: String, required: [true, "Password is required"], trim: true, select: false },
        profilePicture: { type: String, default: "" },  // Profile picture URL
        verified: { type: Boolean, default: true }  // Changed to Boolean ✅
    },
    role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
