const express = require('express');
const router = express.Router();
const { identifier } = require('../middleware/identification');

// Controllers
const otpController = require("../otp-verification/otpVerificationController");
const loginController = require('../login/loginController');
const adminController = require("../controllers/adminController");
const recruiterController = require("../controllers/recruiterController");
const seekerController = require("../controllers/seekerController");
const forgotPasswordController = require('../forgot-password-otp/forgotPasswordController');


// ========================= OTP Routes =========================
router.patch('/auth/send-verification-code', otpController.sendVerificationCode);
router.patch('/auth/verify-verification-code', otpController.verifyCode);

router.patch('/auth/forgot-password-code', forgotPasswordController.sendForgotPasswordCode);
router.patch('/auth/verify-forgotPassword-code', forgotPasswordController.verifyForgotPasswordCode);
router.patch('/auth/reset-password', forgotPasswordController.resetPassword);
// ========================= Login Route =========================
router.post('/auth/login/user', loginController.login);
router.post('/auth/logout/user',  identifier,loginController.logout);

// ========================= Admin Routes =========================
// router.post('/admin/signup', adminController.signup);
router.post('/auth/admin/signout', identifier, adminController.signout);
router.get('/admin/:id', identifier, adminController.getAdminById);

// ========================= Recruiter Routes =========================
router.post('/auth/recruiter/signup', recruiterController.signup);
router.patch('/auth/recruiter/:id/change-password', identifier, recruiterController.changePassword);
router.post('/auth/recruiter/signout', identifier, recruiterController.signout);
router.get('/recruiters', recruiterController.getAllRecruiters);
router.get('/recruiter/:id', identifier, recruiterController.getRecruiterById);
router.delete('/auth/recruiter/:id/delete', identifier, recruiterController.deleteRecruiterById);
router.get('/recruiter/:recruiterId/seekerData', recruiterController.getCompleteSeekerData);
router.get('/recruiter/:recruiterId/seekerData/:seekerId/profileData', recruiterController.getSeekerDataById);

// ========================= Seeker Routes =========================
router.post('/auth/seeker/signup', seekerController.signup);
router.patch('/auth/seeker/:id/change-password', identifier, seekerController.changePassword);
router.post('/auth/seeker/signout', identifier, seekerController.signout);
router.get('/seekers', seekerController.getAllSeekers);

router.get('/seeker/:id', identifier, seekerController.getSeekerById);
router.delete('/auth/seeker/:id/delete', identifier, seekerController.deleteSeekerById);

module.exports = router;
