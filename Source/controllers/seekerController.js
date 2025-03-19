const { signupSchema, changePasswordSchema,  } = require("../middleware/validator");
const seeker  = require('../models/seekerModel');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { registrationDetails, role } = req.body;
    const { email, password } = registrationDetails;

    try {
        const { error } = signupSchema.validate(req.body);
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message }); }

        const existingSeeker = await seeker.findOne({ 'registrationDetails.email': email });
        if (existingSeeker ) { return res.status(400).json({ success: false, message: "Seeker already exists!" }); }

        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);  // ✅ Generate a valid salt
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSeeker = new seeker({
            registrationDetails: { email, password: hashedPassword },
            role: role || 'seeker'
        });

        const result = await newSeeker.save();
        result.registrationDetails.password = undefined;
        res.status(201).json({ success: true, message: "Your account has been registered successfully", result
        });
    }

    catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during registration. Please try again." });
    }
};

exports.signout = async (req,res) =>{
    res.clearCookie('Authorization').status(200).json({success:true, message:'Logged out successfully'})
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { verified } = req.user;
    const seekerId = req.seekerId;

    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });
        if (error) { return res.status(400).json({ success: false, message: error.details[0].message });}
        if (!verified) { return res.status(401).json({ success: false, message: "You are not verified as a Seeker" });}

        const existingSeeker = await seeker.findOne({ _id: seekerId }).select('+registrationDetails.password');
        if (!existingSeeker) { return res.status(401).json({ success: false, message: 'Invalid credentials' });}


        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);  // ✅ Generate a valid salt
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        existingSeeker.registrationDetails.password = hashedPassword;



        await existingSeeker.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all recruiters
exports.getAllSeekers = async (req, res) => {
    try {
        const seekers = await seeker.find();

      res.status(200).json({
      totalSeekers: seekers.length,
       seekers: seekers
    });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get recruiter by ID
exports.getSeekerById = async (req, res) => {
    try {
        const Seeker = await seeker.findById(req.params.id);
        if (!Seeker) {
            return res.status(404).json({ message: 'Seeker not found' });
        }
        res.status(200).json(Seeker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete recruiter by ID
exports.deleteSeekerById = async (req, res) => {
    try {
        const Seeker = await seeker.findByIdAndDelete(req.params.id);
        if (!Seeker) {
            return res.status(404).json({ message: 'Seeker not found' });
        }
        res.status(200).json({ message: 'Seeker deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
