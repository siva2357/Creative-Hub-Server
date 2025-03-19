// university.routes.js (Routes)
const express = require('express');
const router = express.Router();
const recruiterProfileController = require('../profile-details/recruiterProfileController');
const { identifier } = require('../middleware/identification');


router.post('/recruiter/profile-details', identifier,recruiterProfileController.createRecruiterProfile);
router.put('/recruiter/:recruiterId/profile-details', identifier, recruiterProfileController.updateRecruiterProfile);
router.get('/recruiter/:recruiterId/profile-details', identifier, recruiterProfileController.getRecruiterProfile);



module.exports = router;
