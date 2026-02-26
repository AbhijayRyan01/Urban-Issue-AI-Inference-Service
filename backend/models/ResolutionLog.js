const mongoose = require("mongoose");

const ResolutionLogSchema = new mongoose.Schema({
  issueId: mongoose.Schema.Types.ObjectId,
  adminId: mongoose.Schema.Types.ObjectId,
  status: String,
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model("ResolutionLog", ResolutionLogSchema);
