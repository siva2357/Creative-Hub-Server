const Seeker = require("../models/seekerModel");
const SeekerProfile = require("../profile-details/seekerProfileModel");

exports.createSeekerProfile = async (req, res) => {
  try {
    if (!req.seekerId) {
      return res.status(401).json({ message: "Unauthorized: Seeker ID is missing" });
    }

    // Find the seeker using the provided seekerId
    const seeker = await Seeker.findById(req.seekerId);
    if (!seeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }

    // Check if the profile already exists
    const existingProfile = await SeekerProfile.findOne({ seekerId: req.seekerId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this seeker" });
    }

    // Extract basic details from the seeker registration data
    const { registrationDetails } = seeker;
    const { email } = registrationDetails || {};

    // Construct the profileDetails object
    const profileDetails = {
      profilePicture: req.body.profileDetails?.profilePicture || {},
      firstName: req.body.profileDetails?.firstName,
      lastName: req.body.profileDetails?.lastName,
      userName: req.body.profileDetails?.userName,
      email: email || (req.body.profileDetails?.email || ""),
      gender: req.body.profileDetails?.gender,
      dateOfBirth: req.body.profileDetails?.dateOfBirth,
      phoneNumber: req.body.profileDetails?.phoneNumber,
      streetAddress: req.body.profileDetails?.streetAddress,
      city: req.body.profileDetails?.city,
      state: req.body.profileDetails?.state,
      country: req.body.profileDetails?.country,
      pincode: req.body.profileDetails?.pincode,
      universityName: req.body.profileDetails?.universityName,
      universityDegree: req.body.profileDetails?.universityDegree,
      yearOfGraduation: req.body.profileDetails?.yearOfGraduation,
      universityNumber: req.body.profileDetails?.universityNumber,
      bioDescription: req.body.profileDetails?.bioDescription,
    };

    // Create a new SeekerProfile document
    const newSeekerProfile = new SeekerProfile({
      seekerId: req.seekerId,
      profileDetails,
    });

    await newSeekerProfile.save();
    return res.status(201).json({
      message: "Seeker profile created successfully",
      seekerProfile: newSeekerProfile,
    });
  } catch (error) {
    console.error("Error creating seeker profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



exports.getSeekerProfile = async (req, res) => {
  try {
    const seekerId = req.params.seekerId; // Get from URL

    if (!seekerId) {
      return res.status(401).json({ message: "Unauthorized: Seeker ID is missing" });
    }

    console.log("Extracted seeker ID:", seekerId);

    const seeker = await Seeker.findById(seekerId);
    const seekerProfile = await SeekerProfile.findOne({ seekerId });

    if (!seeker || !seekerProfile) {
      return res.status(404).json({ message: "Seeker profile not found" });
    }

    // Update basic details from registration details
    seekerProfile.profileDetails.email = seeker.registrationDetails.email;

    res.status(200).json(seekerProfile);
  } catch (error) {
    console.error("Error fetching seeker profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateSeekerProfile = async (req, res) => {
  try {
    if (!req.seekerId) {
      return res.status(401).json({ message: "Unauthorized: Seeker ID is missing" });
    }

    const seeker = await Seeker.findById(req.seekerId);
    let seekerProfile = await SeekerProfile.findOne({ seekerId: req.seekerId });

    if (!seeker || !seekerProfile) {
      return res.status(404).json({ message: "Seeker profile not found" });
    }

    const { profileDetails } = req.body;
    if (!profileDetails) {
      return res.status(400).json({ message: "Profile details are required" });
    }



    if (profileDetails.email) delete profileDetails.email;
    await seeker.save();

    // Merge the incoming update with the existing profileDetails.
    // This way, any provided field (including basic details) will be updated.
    seekerProfile.profileDetails = {
      ...seekerProfile.profileDetails,
      ...profileDetails,
    };

    // If profilePicture is provided separately, update it explicitly.
    if (profileDetails.profilePicture) {
      seekerProfile.profileDetails.profilePicture = profileDetails.profilePicture;
    }

    await seekerProfile.save();

    res.status(200).json(seekerProfile);
  } catch (error) {
    console.error("Error updating seeker profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



