const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Recruiter = require('../models/recruiterModel');
const Seeker = require('../models/seekerModel');
const Admin = require('../models/adminModel');
const RecruiterProfile = require('../profile-details/recruiterProfileModel');
const SeekerProfile = require("../profile-details/seekerProfileModel");

require('dotenv').config(); // Load environment variables

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required!" });
    }

    const findUser = async (model, role) => {
      const user = await model.findOne({ 'registrationDetails.email': email })
        .select('+registrationDetails.password +registrationDetails.verified');
      if (user) {
        const isValidPassword = await bcrypt.compare(password, user.registrationDetails.password);
        if (!isValidPassword) {
          return null;
        }
        if (!user.registrationDetails.verified) {
          return { unverified: true };
        }
        return { user, role };
      }
      return null;
    };

    let userData = await findUser(Recruiter, 'recruiter')
      || await findUser(Seeker, 'seeker')
      || await findUser(Admin, 'admin');

    if (!userData) {
      return res.status(401).json({ success: false, message: "Invalid email or password!" });
    }

    const { user, role } = userData;

    // Generate JWT token
    const token = jwt.sign({
      userId: user._id,
      email: user.registrationDetails.email,
      role: role,
      userName: user.registrationDetails.userName,
      verified: user.registrationDetails.verified,
    }, process.env.TOKEN_SECRET, { expiresIn: "8h" });

    // Update login metadata
    user.lastLoginAt = new Date();
    user.status = "active";
    await user.save();

    // Default profileComplete to true; for recruiters, check if profile exists and is complete
    let profileComplete = true;
    if (role === "recruiter") {
      const recruiterProfile = await RecruiterProfile.findOne({ recruiterId: user._id });
      profileComplete = isRecruiterProfileComplete(recruiterProfile);
    }

    if (role === "seeker") {
      const seekerProfile = await SeekerProfile.findOne({ seekerId: user._id });
      profileComplete = isSeekerProfileComplete(seekerProfile);
    }


    // Send response with token, profileComplete flag, and config array
    res.cookie('Authorization', 'Bearer ' + token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      secure: false,
    }).json({
      success: true,
      token,
      role,
      verified: user.registrationDetails.verified,
      userId: user._id,
      profileComplete, // Boolean value: true if profile is complete, false otherwise
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "An error occurred during login. Please try again." });
  }
};



function  isRecruiterProfileComplete(profile) {
  if (!profile) return false;
  const profileData = profile.profileDetails;

  return !!(
    profileData
  );
}

function  isSeekerProfileComplete(profile) {
  if (!profile) return false;
  const profileData = profile.profileDetails;


  return !!(
    profileData
  );
}



exports.logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        const { userId, role } = req.user; // Extract user ID and role from the token

        let model;
        if (role === "recruiter") model = Recruiter;
        else if (role === "seeker") model = Seeker;
        else if (role === "admin") model = Admin;
        else return res.status(400).json({ success: false, message: "Invalid role" });

        // Check if user exists
        const user = await model.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update last logout time & set status to inactive
        await model.findByIdAndUpdate(userId, {
            lastLogoutAt: new Date(),
            status: "inactive"
        });

        // Clear token from cookies (optional, only if using cookies for JWT)
        res.clearCookie("Authorization");

        res.json({ success: true, message: "Logged out successfully" });

    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during logout." });
    }
};



