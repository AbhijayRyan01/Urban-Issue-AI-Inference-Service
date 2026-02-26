import React, { useEffect, useState } from "react";
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
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const token = localStorage.getItem("token");

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

  const fetchMonthly = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/analytics/monthly",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMonthlyData(res.data);
    } catch (err) {
      console.error("Monthly fetch error", err);
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
      // Refresh issues, summary cards and monthly chart together
      fetchIssues();
      fetchAnalytics();
      fetchMonthly();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchAnalytics();
    fetchMonthly();
  }, []);

  const cardStyle = {
    flex: 1,
    padding: "20px",
    background: "#f5f5f5",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const chartData = {
  labels: monthlyData.map(item => `${item._id.month}/${item._id.year}`),
  datasets: [
    {
      label: "Total Issues",
      data: monthlyData.map(item => item.count),
      backgroundColor: "rgb(255, 242, 0)",
    },
    {
      label: "Total Issues",
      data: monthlyData.map(item => item.count),
      backgroundColor: "rgba(17, 255, 0, 0.89)",
    },
    {
      label: "Total Issues",
      data: monthlyData.map(item => item.count),
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    },
  ],
};

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <p className="welcome-message">Welcome, Admin 👋</p>

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
