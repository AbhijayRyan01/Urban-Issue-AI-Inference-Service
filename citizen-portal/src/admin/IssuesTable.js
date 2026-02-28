import React from "react";

function IssuesTable({ issues, loading, onStatusChange }) {
  // Exclude resolved issues, then sort by severity descending
  const activeIssues = issues
    .filter((issue) => issue.status !== "Resolved")
    .sort(
      (a, b) =>
        (b.prediction?.severity || 0) - (a.prediction?.severity || 0)
    );

  if (loading) return <p>Loading issues...</p>;

  return (
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
        {activeIssues.map((issue, index) => (
          <tr key={issue._id}>
            <td>{index + 1}</td>
            <td>{issue.description}</td>
            <td>{issue.prediction?.issueType || "-"}</td>
            <td>{issue.prediction?.severity || "-"}</td>
            <td>{issue.prediction?.priority || "-"}</td>
            <td>
              <select
                value={issue.status}
                onChange={(e) => onStatusChange(issue._id, e.target.value)}
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
  );
}

export default IssuesTable;