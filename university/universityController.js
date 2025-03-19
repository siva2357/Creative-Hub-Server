const University = require('../university/universityModel');


exports.createUniversity = async (req, res) => {
  try {
      const { universityDetails } = req.body;
      if (!universityDetails) {
          return res.status(400).json({ message: "University details are required" });
      }
      if (!req.adminId) {
          return res.status(401).json({ message: "Unauthorized: Admin ID is missing" });
      }
      const newUniversity = new University({
          adminId: req.adminId,
          universityDetails
      });
      await newUniversity.save();
      res.status(201).json({ message: "University created successfully", university: newUniversity });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.updateUniversity = async (req, res) => {
    try {

        const updatedUniversity = await University.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUniversity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUniversity = async (req, res) => {
    try {
        await University.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'University deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUniversities = async (req, res) => {
  try {
      const universities = await University.find();
      const totalCount = await University.countDocuments(); // Get total count of universities

      res.status(200).json({
          totalUniversities: totalCount, // Return the total count
          universities: universities // Return the university data
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};



exports.getUniversityById = async (req, res) => {
  try {
      const university = await University.findById(req.params.id);
      if (!university) {
          return res.status(404).json({ message: 'University not found' });
      }
      res.status(200).json(university);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};





