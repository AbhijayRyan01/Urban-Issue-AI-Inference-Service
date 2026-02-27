const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const auth = require("../middleware/auth");
const Issue = require("../models/Issue");
const Prediction = require("../models/Prediction");

// ================================
// Multer config
// ================================
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ================================
// POST /api/issues/report-issue
// ================================
router.post(
  "/report-issue",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { description, location_freq, lat, lng } = req.body;

      if (!req.file || !description) {
        return res.status(400).json({ error: "Image & description required" });
      }

      if (!lat || !lng) {
        return res.status(400).json({ error: "Location required" });
      }

      // Send image to ML service
      const formData = new FormData();
      formData.append("file", fs.createReadStream(req.file.path));
      formData.append("description_length", description.length);
      formData.append("location_freq", location_freq || 1);

      const mlRes = await axios.post(
        "http://127.0.0.1:8001/predict",
        formData,
        { headers: formData.getHeaders() }
      );

      // Save issue
      const issue = await Issue.create({
        userId: req.user.id,
        description,
        imagePath: req.file.path,
        status: "Reported",
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
      });

      // Save prediction
      const prediction = await Prediction.create({
        issue: issue._id,
        issueType: mlRes.data.issue_type,
        confidence: mlRes.data.confidence,
        severity: mlRes.data.severity,
        priority: mlRes.data.priority
      });

      issue.prediction = prediction._id;
      await issue.save();

      res.status(201).json({ issue, prediction });

    } catch (err) {
      console.error("REPORT ISSUE ERROR:", err);
      res.status(500).json({ error: "Issue creation failed" });
    }
  }
);

// ================================
// GET /api/issues/my
// ================================
router.get("/my", auth, async (req, res) => {
  const issues = await Issue.find({ userId: req.user.id })
    .populate("prediction")
    .sort({ createdAt: -1 });

  res.json(issues);
});

// ================================
// GET /api/issues (Admin)
// ================================
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const issues = await Issue.find()
      .populate("prediction")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    console.error("ADMIN FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// ================================
// PATCH /api/issues/issue-status/:id
// ================================
router.patch("/issue-status/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access only" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    const newStatus = req.body.status;
    issue.status = newStatus;

    if (newStatus === "Resolved") {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = null;
    }

    await issue.save();

    res.json(issue);

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;