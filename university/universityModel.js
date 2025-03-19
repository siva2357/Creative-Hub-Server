const mongoose = require('mongoose');


const UniversitySchema = new mongoose.Schema({

  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Reference to Admin model
  totalCount:{type:Number},
  universityDetails: {
    universityId: { type: String, required: true },
    universityLogo: { fileName: { type: String, required: true }, url: { type: String, required: true } },
    universityName: { type: String, required: true },
    universityAddress: { type: String, required: true },
  }
}, { timestamps: true });

module.exports = mongoose.model('University', UniversitySchema);
