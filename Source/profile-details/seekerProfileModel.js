const mongoose = require("mongoose");

const seekerProfileSchema = mongoose.Schema(
  { seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seeker",}, // Reference to Recruiter
    profileDetails: {
      profilePicture: { fileName: { type: String, required: true },url: { type: String, required: true }},
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      userName: { type: String, required: true },
      email: { type: String, required: true },
      gender: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      phoneNumber: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
      universityName: { type: String, required: true },
      universityDegree: { type: String, required: true },
      yearOfGraduation: { type: Date, required: true },
      universityNumber: { type: String, required: true },
      bioDescription: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeekerProfile", seekerProfileSchema);
