// university.routes.js (Routes)
const express = require('express');
const router = express.Router();
const companyController = require("../company/companyController");
const { identifier } = require('../middleware/identification');


router.post('/admin/company', identifier,companyController.createCompany);
router.put('/admin/company/:id', identifier,companyController.updateCompany);
router.delete('/admin/company/:id', identifier,companyController.deleteCompany);
router.get('/companies', identifier,companyController.getCompanies);
router.get('/company/:id', identifier,companyController.getCompanyById);



module.exports = router;
