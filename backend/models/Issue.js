const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    description: {
      type: String,
      required: true
    },

    imagePath: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Reported", "In Progress", "Resolved"],
      default: "Reported"
    },

    // 🔗 LINK TO ML PREDICTION
    prediction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prediction"
    },

    // 📍 For map + heatmap
    location: {
      lat: Number,
      lng: Number
    },

    resolvedAt:{
      type:Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", IssueSchema);