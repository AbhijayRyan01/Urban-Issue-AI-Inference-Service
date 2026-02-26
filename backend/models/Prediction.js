const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",   // 🔥 MUST MATCH model name
      required: true
    },
    issueType: String,
    confidence: Number,
    severity: Number,
    priority: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", PredictionSchema);