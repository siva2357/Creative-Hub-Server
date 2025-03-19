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
router.patch('/send-verification-code', otpController.sendVerificationCode);
router.patch('/verify-verification-code', otpController.verifyCode);

router.patch('/forgot-password-code', forgotPasswordController.sendForgotPasswordCode);
router.patch('/verify-forgotPassword-code', forgotPasswordController.verifyForgotPasswordCode);
router.patch('/reset-password', forgotPasswordController.resetPassword);
// ========================= Login Route =========================
router.post('/login/user', loginController.login);
router.post('/logout/user',  identifier,loginController.logout);

// ========================= Admin Routes =========================
// router.post('/admin/signup', adminController.signup);
router.post('/admin/signout', identifier, adminController.signout);
router.get('/admin/:id', identifier, adminController.getAdminById);


// ========================= Recruiter Routes =========================
router.post('/recruiter/signup', recruiterController.signup);
router.patch('/recruiter/:id/change-password', identifier, recruiterController.changePassword);
router.post('/recruiter/signout', identifier, recruiterController.signout);
router.get('/recruiters', recruiterController.getAllRecruiters);
router.get('/recruiter/:id', identifier, recruiterController.getRecruiterById);
router.delete('/recruiter/:id/delete', identifier, recruiterController.deleteRecruiterById);

// ========================= Seeker Routes =========================
router.post('/seeker/signup', seekerController.signup);
router.patch('/seeker/:id/change-password', identifier, seekerController.changePassword);
router.post('/seeker/signout', identifier, seekerController.signout);
router.get('/seekers', seekerController.getAllSeekers);
router.get('/seeker/:id', identifier, seekerController.getSeekerById);
router.delete('/seeker/:id/delete', identifier, seekerController.deleteSeekerById);

module.exports = router;
