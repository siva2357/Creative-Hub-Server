const { signupSchema} = require("../middleware/validator");
const admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const defaultAdmin = {
  registrationDetails: {
      firstName: "Admin",
      lastName: "User",
      userName: "admin",
      email: "creative.official08@gmail.com",
      password: "Siva@2357",
      profilePicture: "https://res.cloudinary.com/dpp8aspqs/image/upload/v1737024440/Logo_qboacm.svg",
      verified: true
  },
  role: "admin"
};

// Function to create default admin if not exists
const createDefaultAdmin = async () => {
  try {
      const existingAdmin = await admin.findOne({ 'registrationDetails.email': defaultAdmin.registrationDetails.email });
      if (!existingAdmin) {
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(defaultAdmin.registrationDetails.password, salt);

          const admin = new Admin({
              registrationDetails: {
                  ...defaultAdmin.registrationDetails,
                  password: hashedPassword
              },
              role: defaultAdmin.role
          });

          await admin.save();
          console.log("✅ Default admin created successfully.");
      } else {
          console.log("⚠️ Default admin already exists.");
      }
  } catch (error) {
      console.error("❌ Error creating default admin:", error);
  }
};

// Call function on server start
createDefaultAdmin();

// exports.signup = async (req, res) => {
//     const { registrationDetails, role } = req.body;
//     const { firstName, lastName, userName, email, password } = registrationDetails;

//     try {
//         const { error } = signupSchema.validate(req.body);
//         if (error) { return res.status(400).json({ success: false, message: error.details[0].message }); }

//         const existingAdmin = await admin.findOne({ 'registrationDetails.email': email });
//         if (existingAdmin) { return res.status(400).json({ success: false, message: "Admin already exists!" }); }

//         const saltRounds = 12;
//         const salt = await bcrypt.genSalt(saltRounds);  // ✅ Generate a valid salt
//         const hashedPassword = await bcrypt.hash(password, salt);

//         console.log('Hashed Password:', hashedPassword);

//         const newAdmin  = new admin({
//             registrationDetails: { firstName, lastName, userName, email,password: hashedPassword },
//             role: role || 'admin',
//         });

//         const result = await newAdmin .save();
//         result.registrationDetails.password = undefined;
//         res.status(201).json({ success: true, message: "Your account has been registered successfully", result
//         });
//     }

//     catch (error) {
//         console.error("Signup Error:", error);
//         res.status(500).json({ success: false, message: "An error occurred during registration. Please try again." });
//     }
// };

exports.signout = async (req,res) =>{
    res.clearCookie('Authorization').status(200).json({success:true, message:'Logged out successfully'})
};



// Get recruiter by ID
exports.getAdminById = async (req, res) => {
    try {
        const Admin = await admin.findById(req.params.id);
        if (!Admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(Admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
