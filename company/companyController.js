const Company = require('../company/companyModel');


exports.createCompany = async (req, res) => {
  try {
      const { companyDetails } = req.body;
      if (! companyDetails) {
          return res.status(400).json({ message: "Company details are required" });
      }
      if (!req.adminId) {
          return res.status(401).json({ message: "Unauthorized: Admin ID is missing" });
      }
      const newCompany = new Company({
          adminId: req.adminId,
          companyDetails
      });
      await newCompany.save();
      res.status(201).json({ message: "Company created successfully", company: newCompany });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.updateCompany  = async (req, res) => {
    try {
        const updatedCompany  = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteCompany  = async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Company  deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getCompanies = async (req, res) => {
  try {
      const companies = await  Company.find();
      const totalCount = await  Company.countDocuments(); // Get total count of universities

      res.status(200).json({
          totalCompanies: totalCount, // Return the total count
          companies: companies // Return the university data
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


exports.getCompanyById = async (req, res) => {
  try {
      const company = await Company .findById(req.params.id);
      if (!company) {
          return res.status(404).json({ message: 'Company  not found' });
      }
      res.status(200).json(company);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};





