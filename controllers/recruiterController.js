const { signupSchema, changePasswordSchema} = require("../middleware/validator");
const recruiter = require('../models/recruiterModel');
const bcrypt = require('bcryptjs');

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


// Delete recruiter by ID
exports.deleteRecruiterById = async (req, res) => {
    try {
        const Recruiter = await recruiter.findByIdAndDelete(req.params.id);
        if (!Recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }
        res.status(200).json({ message: 'Recruiter deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
