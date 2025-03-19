const RecruiterProfile = require('../profile-details/recruiterProfileModel');
const Recruiter = require('../models/recruiterModel');


exports.createRecruiterProfile = async (req, res) => {
  try {
    if (!req.recruiterId) {
      return res.status(401).json({ message: "Unauthorized: Recruiter ID is missing" });
    }
    const recruiter = await Recruiter.findById(req.recruiterId);
    if (!recruiter) {
      return res.status(404).json({ message: "Seeker not found" });
    }
    const existingProfile = await RecruiterProfile.findOne({ recruiterId: req.recruiterId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this recruiter" });
    }
    const { registrationDetails } = recruiter;
    const { email } = registrationDetails || {};
    const profileDetails = {
      profilePicture: req.body.profileDetails.profilePicture || {},
      firstName: req.body.profileDetails.firstName,
      lastName: req.body.profileDetails.lastName,
      userName: req.body.profileDetails.userName,
      email: email || (req.body.profileDetails.email || ""),
      gender: req.body.profileDetails.gender,
      dateOfBirth: req.body.profileDetails.dateOfBirth,
      phoneNumber: req.body.profileDetails.phoneNumber,
      streetAddress: req.body.profileDetails.streetAddress,
      city: req.body.profileDetails.city,
      state: req.body.profileDetails.state,
      country: req.body.profileDetails.country,
      pincode: req.body.profileDetails.pincode,
      companyName: req.body.profileDetails.companyName,
      designation: req.body.profileDetails.designation,
      experience: req.body.profileDetails.experience,
      universityNumber: req.body.profileDetails.universityNumber,
      employeeCode: req.body.profileDetails. employeeCode,
      bioDescription: req.body.profileDetails.bioDescription,
    };

    // Create a new SeekerProfile document
    const newRecruiterProfile = new RecruiterProfile({
      recruiterId: req.recruiterId,
      profileDetails,
    });

    await  newRecruiterProfile.save();
    return res.status(201).json({
      message: "Seeker profile created successfully",
      recruiterProfile:  newRecruiterProfile,
    });
  } catch (error) {
    console.error("Error creating recruiter profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRecruiterProfile = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId; // Get from URL

    if (!recruiterId) {
      return res.status(401).json({ message: "Unauthorized: Recruiter ID is missing" });
    }

    console.log("Extracted seeker ID:", recruiterId);

    const recruiter = await Recruiter.findById(recruiterId);
    const recruiterProfile = await RecruiterProfile.findOne({ recruiterId });

    if (!recruiter || !recruiterProfile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    // Update basic details from registration details
    recruiterProfile.profileDetails.email = recruiter .registrationDetails.email;

    res.status(200).json(recruiterProfile);
  } catch (error) {
    console.error("Error fetching seeker profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateRecruiterProfile = async (req, res) => {
  try {
    if (!req.recruiterId) {
      return res.status(401).json({ message: "Unauthorized: Recruiter ID is missing" });
    }

    const recruiter = await Recruiter.findById(req.recruiterId);
    let recruiterProfile = await RecruiterProfile.findOne({ recruiterId: req.recruiterId });

    if (!recruiter  || !recruiterProfile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const { profileDetails } = req.body;
    if (!profileDetails) {
      return res.status(400).json({ message: "Profile details are required" });
    }

    if (profileDetails.email) delete profileDetails.email;
    await recruiter.save();

    // Merge the incoming update with the existing profileDetails.
    // This way, any provided field (including basic details) will be updated.
    recruiterProfile.profileDetails = {
      ...recruiterProfile.profileDetails,
      ...profileDetails,
    };

    // If profilePicture is provided separately, update it explicitly.
    if (profileDetails.profilePicture) {
      recruiterProfile.profileDetails.profilePicture = profileDetails.profilePicture;
    }

    await recruiterProfile.save();

    res.status(200).json(recruiterProfile);
  } catch (error) {
    console.error("Error updating recruiter profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

