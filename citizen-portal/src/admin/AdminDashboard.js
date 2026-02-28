import React, { useEffect, useState, useMemo, useCallback } from "react";
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

const MONTHS = [
  { value: "", label: "All Months" },
  { value: 1,  label: "January" },
  { value: 2,  label: "February" },
  { value: 3,  label: "March" },
  { value: 4,  label: "April" },
  { value: 5,  label: "May" },
  { value: 6,  label: "June" },
  { value: 7,  label: "July" },
  { value: 8,  label: "August" },
  { value: 9,  label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // ── Filter state ──
  const [filterMonth,    setFilterMonth]    = useState("");
  const [filterYear,     setFilterYear]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOGOUT HANDLER
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchIssues = useCallback(async () => {
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
  }, [token]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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

  // ── Derive available years from issues list ──
  const availableYears = useMemo(() => {
    const years = new Set(
      issues
        .filter((i) => i.createdAt && !isNaN(new Date(i.createdAt)))
        .map((i) => new Date(i.createdAt).getFullYear())
    );
    return Array.from(years).sort((a, b) => a - b);
  }, [issues]);

  // ── Apply all filters to issues ──
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (!issue.createdAt) return false;
      const date = new Date(issue.createdAt);
      if (isNaN(date)) return false;

      const monthMatch    = filterMonth    === "" || date.getMonth() + 1 === Number(filterMonth);
      const yearMatch     = filterYear     === "" || date.getFullYear()  === Number(filterYear);
      const statusMatch   = filterStatus   === "" || issue.status   === filterStatus;
      const priorityMatch = filterPriority === "" || issue.priority === filterPriority;
      return monthMatch && yearMatch && statusMatch && priorityMatch;
    });
  }, [issues, filterMonth, filterYear, filterStatus, filterPriority]);

  const monthlySummary = useMemo(() => {
    const map = new Map();

    issues.forEach((issue) => {
      if (!issue.createdAt) return;
      const date = new Date(issue.createdAt);
      if (isNaN(date)) return;

      const year  = date.getFullYear();
      const month = date.getMonth() + 1;
      const key   = `${year}-${month}`;

      if (!map.has(key)) {
        map.set(key, { _id: { year, month }, reportedCount: 0, inProgressCount: 0, resolvedCount: 0 });
      }

      const bucket = map.get(key);
      bucket.reportedCount += 1;
      if (issue.status === "In Progress") bucket.inProgressCount += 1;
      else if (issue.status === "Resolved") bucket.resolvedCount += 1;
    });

    return Array.from(map.values()).sort(
      (a, b) => a._id.year - b._id.year || a._id.month - b._id.month
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

  const selectStyle = {
    padding: "7px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: 14,
    cursor: "pointer",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    outline: "none",
  };

  const chartData = {
    labels: monthlySummary.map((item) => `${item._id.month}/${item._id.year}`),
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

      {/* ── Top Bar ── */}
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

        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg, #ec5b13, #ff7a00)",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            padding: "8px 18px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(236, 91, 19, 0.3)",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 14px rgba(236, 91, 19, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 10px rgba(236, 91, 19, 0.3)";
          }}
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
            options={{ responsive: true, maintainAspectRatio: false }}
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

      {/* ── Issues Table with Month / Year / Status / Priority filters ── */}
      <div className="table-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
          {/* Left: title + count */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h3 style={{ margin: 0 }}>Issues Table</h3>
            <span style={{ color: "#888", fontSize: 13 }}>
              Showing {filteredIssues.length} of {issues.length} issues
            </span>
          </div>

          {/* Right: all four filters + clear button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Month */}
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={selectStyle}>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Year */}
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={selectStyle}>
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Status */}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Priority */}
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Clear — only visible when any filter is active */}
            {(filterMonth !== "" || filterYear !== "" || filterStatus !== "" || filterPriority !== "") && (
              <button
                onClick={() => { setFilterMonth(""); setFilterYear(""); setFilterStatus(""); setFilterPriority(""); }}
                style={{ ...selectStyle, background: "#f0f0f0", color: "#555", border: "1px solid #ccc", fontWeight: 500 }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <IssuesTable
          issues={filteredIssues}
          loading={loadingIssues}
          onStatusChange={updateIssueStatus}
        />
      </div>

      {/* ── Resolved Issues Table with same filters ── */}
      <div className="table-section" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
          <h3 style={{ margin: 0 }}>Resolved Issues Table</h3>
          <span style={{ color: "#888", fontSize: 13 }}>
            (uses same filters above)
          </span>
        </div>

        <ResolvedIssuesTable
          issues={filteredIssues}
          loading={loadingIssues}
          onStatusChange={updateIssueStatus}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;