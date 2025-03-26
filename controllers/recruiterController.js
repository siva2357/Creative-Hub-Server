const { signupSchema, changePasswordSchema} = require("../middleware/validator");
const recruiter = require('../models/recruiterModel');
const bcrypt = require('bcryptjs');
const JobPost = require('../jobPosts/jobPostModel');
const RecruiterProfile = require('../profile-details/recruiterProfileModel');


const seeker  = require('../models/seekerModel');

const SeekerProfile = require('../profile-details/seekerProfileModel');
const ProjectUpload = require('../project-upload/projectUploadModel');
const mongoose = require('mongoose');

exports.signup = async (req, res) => {
  const { registrationDetails, role } = req.body;
  const { email, password } = registrationDetails;

  try {
      const { error } = signupSchema.validate(req.body);
      if (error) {
          return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const existingRecruiter = await recruiter.findOne({ 'registrationDetails.email': email });
      if (existingRecruiter) {
          return res.status(400).json({ success: false, message: "Recruiter already exists!" });
      }

      const saltRounds = 12;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newRecruiter = new recruiter({
          registrationDetails: {
              email,
              password: hashedPassword
          },
          role: role || 'recruiter',
      });

      const result = await newRecruiter.save();

      res.status(201).json({
          success: true,
          message: "Your account has been registered successfully",
          result: { email: result.registrationDetails.email, role: result.role }
      });
  } catch (error) {
      console.error("Signup Error:", error);
      if (error.code === 11000) {
          return res.status(400).json({ success: false, message: "Email already exists!" });
      }
      res.status(500).json({ success: false, message: "An error occurred during registration. Please try again." });
  }
};

exports.signout = async (req,res) =>{
    res.clearCookie('Authorization').status(200).json({success:true, message:'Logged out successfully'})
};

exports.changePassword = async (req, res) => {
    const { verified } = req.user;
    const recruiterId = req.recruiterId;
    const { oldPassword, newPassword } = req.body;

    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) {return res.status(400).json({ success: false, message: error.details[0].message });}

        if (!verified) { return res.status(401).json({ success: false, message: "You are not verified as a recruiter" });}

        const existingRecruiter = await recruiter.findOne({ _id: recruiterId }).select('+registrationDetails.password');
        if (!existingRecruiter) { return res.status(401).json({ success: false, message: 'Invalid credentials' });}


        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);  // ✅ Generate a valid salt
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        existingRecruiter.registrationDetails.password = hashedPassword;


        await existingRecruiter.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all recruiters
exports.getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await  recruiter.find(); // Make sure your model name is correct (Recruiter)
    res.status(200).json({
      totalRecruiters: recruiters.length,
      recruiters: recruiters
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter by ID
exports.getRecruiterById = async (req, res) => {
    try {
        const Recruiter = await recruiter.findById(req.params.id);
        if (!Recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }
        res.status(200).json(Recruiter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteRecruiterById = async (req, res) => {
    try {
        const recruiterId = req.params.id;

        // Find the recruiter first
        const foundRecruiter = await recruiter.findById(recruiterId);
        if (!foundRecruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        // Delete all job posts created by this recruiter
        await JobPost.deleteMany({ recruiterId });

        // Delete all job applications related to this recruiter's job posts
        await RecruiterProfile.deleteMany({ recruiterId });

        // Finally, delete the recruiter
        await recruiter.findByIdAndDelete(recruiterId);

        res.status(200).json({ message: "Recruiter and related data deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};









exports.getCompleteSeekerData = async (req, res) => {
    try {
        const { recruiterId } = req.params;

        // Check if recruiterId is provided and valid
        if (!recruiterId) {
            return res.status(400).json({ message: "Recruiter ID is required." });
        }
        if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
            return res.status(400).json({ message: "Invalid recruiter ID format." });
        }

        // Check if recruiter exists
        const recruiterExists = await recruiter.findById(recruiterId);
        if (!recruiterExists) {
            return res.status(404).json({ message: "Recruiter not found." });
        }

        // Fetch all seekers
        const seekers = await seeker.find().lean();

        // Fetch related seeker profile and project count for each seeker
        const seekersWithDetails = await Promise.all(
            seekers.map(async (seeker) => {
                const profile = await SeekerProfile.findOne({ seekerId: seeker._id }).lean();
                const projects = await ProjectUpload.find({ seekerId: seeker._id }).lean();
                const projectCount = await ProjectUpload.countDocuments({ seekerId: seeker._id });

                return {
                    ...seeker,
                    profile: profile || {},
                    seekerProjectUpload: projects || [],
                    totalProjects: projectCount
                };
            })
        );

        res.status(200).json({
            totalSeekers: seekersWithDetails.length,
            seekers: seekersWithDetails
        });

    } catch (error) {
        console.error("Error fetching seeker data:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


exports.getSeekerDataById = async (req, res) => {
    try {
        const { seekerId } = req.params;

        // Validate seekerId
        if (!mongoose.Types.ObjectId.isValid(seekerId)) {
            return res.status(400).json({ message: "Invalid seeker ID format" });
        }

        // Fetch seeker details by ID
        const seekerData = await seeker.findById(seekerId).lean();
        if (!seekerData) {
            return res.status(404).json({ message: "Seeker not found." });
        }

        // Fetch profile details
        const profile = await SeekerProfile.findOne({ seekerId: seekerId }).lean();

        // Fetch projects related to seeker
        const projects = await ProjectUpload.find({ seekerId: seekerId }).lean();

        // Count total projects
        const projectCount = await ProjectUpload.countDocuments({ seekerId: seekerId });

        // Send response with complete data
        res.status(200).json({
            ...seekerData, // Use the correct seeker data
            profile: profile || {}, // Attach profile details
            seekerProjectUpload: projects || [], // Attach all project details
            totalProjects: projectCount // Attach project count
        });

    } catch (error) {
        console.error("Error fetching seeker data:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};