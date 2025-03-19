// university.routes.js (Routes)
const express = require('express');
const router = express.Router();
const seekerProfileController = require('../profile-details/seekerProfileController');
const { identifier } = require('../middleware/identification');


router.post('/seeker/profile-details', identifier,seekerProfileController.createSeekerProfile);
router.put('/seeker/:seekerId/profile-details', identifier, seekerProfileController.updateSeekerProfile);
router.get('/seeker/:seekerId/profile-details', identifier, seekerProfileController.getSeekerProfile);



module.exports = router;
