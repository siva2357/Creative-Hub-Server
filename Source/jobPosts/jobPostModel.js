
const mongoose = require("mongoose");
const jobPostSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company"},
    totalJobposts: { type: Number }, // Default value for safety
    totalApplicants: { type: Number }, // ✅ Tracks total applicants
    jobPostDetails: {
      jobId: { type: String, required: true }, // Consider using ObjectId if it's unique per job
      jobType: { type: String, required: true },
      jobTitle: { type: String, required: true },
      jobCategory: { type: String, required: true },
      experience: { type: String, required: true },
      salary: { type: String, required: true },
      vacancy: { type: String, required: true },
      location: { type: String, required: true },
      qualification: { type: String, required: true },
      jobDescription: { type: String, required: true },
      postedOn: { type: Date, default: Date.now },
      applyByDate: { type: Date, required: true },
      status: { type: String, enum: ["Open", "Closed"], default: "Open"},
    },
    applicants: [
      {
        seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seeker" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` automatically
);

module.exports = mongoose.model("JobPost", jobPostSchema);


