// university.routes.js (Routes)
const express = require('express');
const router = express.Router();
const universityController = require('../university/universityController');
const { identifier } = require('../middleware/identification');


router.post('/admin/university', identifier,universityController.createUniversity);
router.put('/admin/university/:id', identifier, universityController.updateUniversity);
router.delete('/admin/university/:id', identifier, universityController.deleteUniversity);
router.get('/universities', identifier, universityController.getUniversities);
router.get('/university/:id', identifier, universityController.getUniversityById);



module.exports = router;
