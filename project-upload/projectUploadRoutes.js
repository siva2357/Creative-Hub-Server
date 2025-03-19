// university.routes.js (Routes)
const express = require('express');
const router = express.Router();
const projectUploadController = require("./projectUploadController");
const { identifier } = require('../middleware/identification');

router.post('/seeker/project', identifier,projectUploadController.createProjectUpload);
router.put('/seeker/:seekerId/project/:projectId/update', identifier,projectUploadController.updateProject);
router.delete("/seeker/:seekerId/project/:projectId/delete", identifier, projectUploadController.deleteProject);

router.get("/seeker/:seekerId/projects", identifier,projectUploadController.getProjects);
router.get("/seeker/:seekerId/project/:projectId",identifier,projectUploadController.getProjectById);


module.exports = router;
