import React, { useState } from "react";

function IssuesTable({ issues, loading, onStatusChange }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // ============================
  // Apply Filters + Sorting (exclude resolved)
  // ============================
  const activeIssues = issues.filter((issue) => issue.status !== "Resolved");

  const filteredIssues = activeIssues
    .filter((issue) =>
      statusFilter === "All" ? true : issue.status === statusFilter
    )
    .filter((issue) =>
      priorityFilter === "All"
        ? true
        : issue.prediction?.priority === priorityFilter
    )
    .sort(
      (a, b) =>
        (b.prediction?.severity || 0) -
        (a.prediction?.severity || 0)
    );

  if (loading) return <p>Loading issues...</p>;

  return (
    <>
      {/* ================= FILTER CONTROLS ================= */}
      <div style={{ marginBottom: "15px" }}>
        <label>Status: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Reported">Reported</option>
          <option value="In Progress">In Progress</option>
        </select>

        <label style={{ marginLeft: "20px" }}>Priority: </label>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Emergency">Emergency</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* ================= ISSUES TABLE ================= */}
      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Sl No.</th>
            <th>Description</th>
            <th>Issue Type</th>
            <th>Severity</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reported At</th>
          </tr>
        </thead>

        <tbody>
          {filteredIssues.map((issue, index) => (
            <tr key={issue._id}>
              <td>{index + 1}</td>
              <td>{issue.description}</td>

              {/* ✅ ML DATA */}
              <td>{issue.prediction?.issueType || "-"}</td>
              <td>{issue.prediction?.severity || "-"}</td>
              <td>{issue.prediction?.priority || "-"}</td>

              <td>
                <select
                  value={issue.status}
                  onChange={(e) =>
                    onStatusChange(issue._id, e.target.value)
                  }
                >
                  <option>Reported</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </td>

              <td>{new Date(issue.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default IssuesTable;
