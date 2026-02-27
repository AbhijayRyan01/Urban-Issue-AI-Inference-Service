import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import IssuesTable from "./IssuesTable";
import ResolvedIssuesTable from "./ResolvedIssuesTable";
import MapView from "./MapView";
import HeatmapView from "./HeatmapView";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const token = localStorage.getItem("token");

  // =========================
  // LOGOUT HANDLER
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      const res = await axios.get("http://localhost:5000/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(res.data);
    } catch (err) {
      console.error("Issues fetch error", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/analytics/summary",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics fetch error", err);
    }
  };

  const updateIssueStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/issues/issue-status/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchIssues();
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchAnalytics();
  }, []);

  const monthlySummary = useMemo(() => {
    const map = new Map();

    issues.forEach((issue) => {
      if (!issue.createdAt) return;

      const date = new Date(issue.createdAt);
      if (isNaN(date)) return;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!map.has(key)) {
        map.set(key, {
          _id: { year, month },
          reportedCount: 0,
          inProgressCount: 0,
          resolvedCount: 0,
        });
      }

      const bucket = map.get(key);
      bucket.reportedCount += 1;

      if (issue.status === "In Progress") {
        bucket.inProgressCount += 1;
      } else if (issue.status === "Resolved") {
        bucket.resolvedCount += 1;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        a._id.year - b._id.year || a._id.month - b._id.month
    );
  }, [issues]);

  const cardStyle = {
    flex: 1,
    padding: "20px",
    background: "#f5f5f5",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const chartData = {
    labels: monthlySummary.map(
      (item) => `${item._id.month}/${item._id.year}`
    ),
    datasets: [
      {
        label: "Issues Reported",
        data: monthlySummary.map((item) => item.reportedCount),
        backgroundColor: "rgba(255, 242, 0, 0.62)",
      },
      {
        label: "In Progress",
        data: monthlySummary.map((item) => item.inProgressCount),
        backgroundColor: "rgba(17, 255, 0, 0.89)",
      },
      {
        label: "Resolved",
        data: monthlySummary.map((item) => item.resolvedCount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="dashboard-container">

      {/* ── Top Bar with Logout (styled like IssueForm header) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div>
          <h2 className="dashboard-title" style={{ margin: 0 }}>
            Admin Dashboard
          </h2>
          <p className="welcome-message" style={{ margin: "4px 0 0" }}>
            Welcome, Admin 👋
          </p>
        </div>

        {/* Logout button – mimic IssueForm.js styles.logoutBtn */}
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            padding: 0,
          }}
          className="nav-link"
        >
          Logout
        </button>
      </div>

      {analytics && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={cardStyle}>
            <h3>Total Issues</h3>
            <p>{analytics.totalIssues}</p>
          </div>
          <div style={cardStyle}>
            <h3>Active Issues</h3>
            <p>{analytics.activeIssues}</p>
          </div>
          <div style={cardStyle}>
            <h3>Resolved Issues</h3>
            <p>{analytics.resolvedIssues}</p>
          </div>
          <div style={cardStyle}>
            <h3>Avg Resolution Time (hrs)</h3>
            <p>{analytics.avgResolutionTimeHours}</p>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h3>Monthly Issue Trend</h3>
        <div className="chart-wrapper">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      <div className="maps-container">
        <div className="map-section">
          <h3>Issue Density Heatmap</h3>
          <HeatmapView issues={issues} />
        </div>
        <div className="map-section">
          <h3>Issue Map View</h3>
          <MapView issues={issues} />
        </div>
      </div>

      <div className="table-section">
        <h3>Issues Table</h3>
        <IssuesTable
          issues={issues}
          loading={loadingIssues}
          onStatusChange={updateIssueStatus}
        />
      </div>

      <div className="table-section" style={{ marginTop: "20px" }}>
        <h3>Resolved Issues Table</h3>
        <ResolvedIssuesTable
          issues={issues}
          loading={loadingIssues}
          onStatusChange={updateIssueStatus}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;