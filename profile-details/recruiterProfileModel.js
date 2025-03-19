const mongoose = require("mongoose");

const recruiterProfileSchema = mongoose.Schema(
  { recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter" }, // Reference to Recruiter
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
      companyName: { type: String, required: true },
      designation: { type: String, required: true },
      experience: { type: String, required: true },
      employeeCode: { type: String, required: true },
      bioDescription: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruiterProfile", recruiterProfileSchema);
