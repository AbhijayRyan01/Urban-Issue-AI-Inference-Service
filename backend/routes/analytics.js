const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Issue = require("../models/Issue");

// ================================
// GET /api/analytics/summary
// ================================
router.get("/summary", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access only" });
    }

    const totalIssues = await Issue.countDocuments();
    const activeIssues = await Issue.countDocuments({
      status: { $ne: "Resolved" }
    });
    const resolvedIssues = await Issue.countDocuments({
      status: "Resolved"
    });

    const emergencyPending = await Issue.countDocuments({
      status: { $ne: "Resolved" }
    }).populate("prediction");

    // 🔥 Calculate Average Resolution Time
    const resolved = await Issue.find({
      status: "Resolved",
      resolvedAt: { $ne: null }
    });

    let totalResolutionTime = 0;

    resolved.forEach(issue => {
      const diff =
        new Date(issue.resolvedAt) - new Date(issue.createdAt);
      totalResolutionTime += diff;
    });

    const avgResolutionTimeHours =
      resolved.length > 0
        ? (totalResolutionTime / resolved.length) / (1000 * 60 * 60)
        : 0;

    res.json({
      totalIssues,
      activeIssues,
      resolvedIssues,
      avgResolutionTimeHours: avgResolutionTimeHours.toFixed(2)
    });

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ================================
// GET /api/analytics/monthly
// ================================
router.get("/monthly", auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access only" });
    }

    const monthlyData = await Issue.aggregate([
      // First group by year, month, and status
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      // Then re-group by year and month to compute per-status counts
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month"
          },
          reportedCount: {
            $sum: {
              $cond: [
                { $eq: ["$_id.status", "Reported"] },
                "$count",
                0
              ]
            }
          },
          inProgressCount: {
            $sum: {
              $cond: [
                { $eq: ["$_id.status", "In Progress"] },
                "$count",
                0
              ]
            }
          },
          resolvedCount: {
            $sum: {
              $cond: [
                { $eq: ["$_id.status", "Resolved"] },
                "$count",
                0
              ]
            }
          },
          totalCount: { $sum: "$count" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(monthlyData);

  } catch (err) {
    console.error("MONTHLY ANALYTICS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch monthly data" });
  }
});

module.exports = router;