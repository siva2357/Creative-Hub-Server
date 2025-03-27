const express = require("express");
const router = express.Router();
const jobPostController = require("../jobPosts/jobPostController");
const { identifier } = require('../middleware/identification');

// ✅ Recruiter Side
router.post("/recruiter/jobpost", identifier, jobPostController.createJobPost);
router.put("/recruiter/:recruiterId/jobPost/:jobId/update", identifier, jobPostController.updateJobPost);

router.put("/recruiter/:recruiterId/jobPost/:jobId/close", identifier, jobPostController.closeJobPost);
router.put("/recruiter/:recruiterId/jobPost/:jobId/reopen", identifier, jobPostController.reopenJobPost);

router.delete("/recruiter/:recruiterId/jobPost/:jobId/delete", identifier, jobPostController.deleteJobPost);

router.get("/seeker/:seekerId/jobPosts", identifier,jobPostController.getAllJobs);
router.get("/seeker/jobPost/:jobId", identifier,jobPostController.getJobById);


router.get("/recruiter/:recruiterId/jobPosts", jobPostController.getJobsByRecruiter);
router.get("/recruiter/:recruiterId/jobPost/:jobId",jobPostController.getRecruiterJobPostById);
router.get("/recruiter/:recruiterId/jobPosts/closed", jobPostController.getClosedJobsByRecruiter);
router.get("/recruiter/:recruiterId/jobPosts/Applicants",  jobPostController.getJobApplicantsByRecruiter);



router.post("/seeker/:seekerId/job-post/:jobId/apply",identifier, jobPostController.applyForJob);
router.post("/seeker/:seekerId/job-post/:jobId/withdraw", identifier,jobPostController.withdrawApplication);
router.get("/seeker/:seekerId/applied-jobs", jobPostController.getAppliedJobs);
router.get("/seeker/:seekerId/applied-job/:jobId", jobPostController.getAppliedJobById);

router.get("/recruiter/:recruiterId/jobpost/:jobId/applicants",  jobPostController.getJobApplicants);


module.exports = router;
