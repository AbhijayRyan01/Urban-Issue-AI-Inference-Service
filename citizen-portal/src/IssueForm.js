import React, { useState } from "react";
import axios from "axios";

function IssueForm() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [locationFreq, setLocationFreq] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // LOGOUT HANDLER
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // =========================
  // FORM SUBMIT HANDLER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !description || !locationFreq) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("location_freq", locationFreq);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/issues/report-issue",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error submitting issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px" }}>
      {/* LOGOUT BUTTON */}
      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>

      <h2>Smart City Issue Reporting</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload Image:</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <br />

        <div>
          <label>Description:</label><br />
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <br />

        <div>
          <label>Location Frequency:</label><br />
          <input
            type="number"
            value={locationFreq}
            onChange={(e) => setLocationFreq(e.target.value)}
          />
        </div>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Report Issue"}
        </button>
      </form>

      {/* RESULT DISPLAY */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Issue Reported Successfully</h3>
          <p><b>Issue Type:</b> {result.prediction.issueType}</p>
          <p><b>Severity:</b> {result.prediction.severity}</p>
          <p><b>Priority:</b> {result.prediction.priority}</p>
          <p><b>Status:</b> {result.issue.status}</p>
        </div>
      )}
    </div>
  );
}

export default IssueForm;
