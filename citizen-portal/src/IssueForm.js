import React, { useState, useRef } from "react";
import axios from "axios";
import symbol from "./assets/symbol.jpg";   // adjust path if needed
import "./IssueForm.css"; // Responsive styles
// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: "'Public Sans', sans-serif",
    minHeight: "100vh",
    background: "rgba(255, 255, 255, 1)",
    color: "#0f172a",
  },
  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px clamp(16px, 5vw, 80px)",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  headerBrand: { display: "flex", alignItems: "center", gap: 10 },
  headerLogo: {
    width: 40, height: 40,
    //background: "#ec5b13",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 20,
  },
  headerTitle: { fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 800, color: "#0f172a", margin: 0 },
  headerNav: { display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 24px)" },
  navLink: {
    color: "#64748b", fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 500,
    textDecoration: "none", cursor: "pointer",
    transition: "color 0.2s",
  },
  logoutBtn: {
    background: "none", border: "none",
    color: "#64748b", fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 500,
    cursor: "pointer", padding: 0,
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    border: "2px solid rgba(236,91,19,0.2)",
    background: "rgba(236,91,19,0.1)",
    overflow: "hidden",
  },
  logoImage: {
    width: 28,
    height: 28,
    objectFit: "contain"
  },
  // Main
  main: { maxWidth: 1280, margin: "0 auto", padding: "clamp(16px, 5vw, 32px) clamp(16px, 5vw, 80px)" },
  hero: { marginBottom: "clamp(16px, 5vw, 32px)" },
  heroTitle: {
    fontSize: "clamp(24px, 7vw, 36px)", fontWeight: 900, color: "#0f172a",
    letterSpacing: "-0.5px", margin: "0 0 8px",
  },
  heroSub: { fontSize: "clamp(14px, 4vw, 18px)", color: "#64748b", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 32,
  },
  // Card
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    padding: "clamp(16px, 5vw, 24px)",
  },
  // Upload Zone
  uploadZone: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    width: "100%", height: "clamp(120px, 30vw, 192px)",
    border: "2px dashed #cbd5e1",
    borderRadius: 12,
    background: "#f8fafc",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  uploadZoneActive: {
    background: "rgba(236,91,19,0.04)",
    borderColor: "#ec5b13",
  },
  uploadIcon: { fontSize: "clamp(28px, 8vw, 40px)", color: "#94a3b8", marginBottom: 8 },
  uploadLabel: { fontSize: "clamp(12px, 3vw, 14px)", color: "#64748b" },
  uploadSub: { fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", marginTop: 4 },
  uploadPreview: {
    width: "100%", height: "100%",
    objectFit: "cover", position: "absolute", inset: 0,
    borderRadius: 10,
  },
  // Field Grid
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "#334155" },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    cursor: "pointer",
  },
  // Priority Buttons
  priorityGroup: { display: "flex", gap: 8 },
  priorityBtn: {
    flex: 1, padding: "9px 12px",
    borderRadius: 8, fontSize: 14,
    border: "1px solid #e2e8f0",
    background: "#fff", color: "#64748b",
    cursor: "pointer", transition: "all 0.15s",
    fontWeight: 400,
  },
  priorityBtnActive: {
    //borderColor: "#FFFFFF",
    background: "rgba(236,91,19,0.08)",
    //color: "#FFFFF",
    fontWeight: 600,
  },
  // Location
  locationWrapper: { position: "relative" },
  locationIcon: {
    position: "absolute", left: 12,
    top: "50%", transform: "translateY(-50%)",
    color: "#94a3b8", fontSize: 20, pointerEvents: "none",
  },
  locationInput: {
    width: "100%", paddingLeft: 12, paddingRight: 12,
    paddingTop: 10, paddingBottom: 10,
    borderRadius: 12, border: "1px solid #e2e8f0",
    background: "#fff", fontSize: 14, color: "#0f172a",
    outline: "none", boxSizing: "border-box",
  },
  mapPreview: {
    marginTop: 8, height: 160,
    borderRadius: 12, overflow: "hidden",
    background: "#e2e8f0", position: "relative",
  },
  mapImg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 },
  mapPin: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    background: "#ec5b13", color: "#fff",
    borderRadius: "50%", padding: 8,
    boxShadow: "0 2px 8px rgba(236,91,19,0.4)",
    fontSize: 20,
    animation: "bounce 1s infinite",
  },
  detectBtn: {
    position: "absolute", bottom: 8, right: 8,
    background: "#fff", border: "1px solid #e2e8f0",
    padding: "6px 12px", borderRadius: 8,
    fontSize: 12, fontWeight: 500,
    cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  // Description
  textarea: {
    width: "100%", padding: "10px 14px",
    borderRadius: 12, border: "1px solid #e2e8f0",
    background: "#fff", fontSize: 14, color: "#0f172a",
    outline: "none", resize: "vertical",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  // Submit
  submitBtn: {
    width: "100%",
    background: "#1a355b",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "16px",
    fontSize: 16, fontWeight: 700,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 12px rgba(26,53,91,0.3)",
    transition: "background 0.2s, opacity 0.2s",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  // Result Card
  resultCard: {
    marginTop: 24, padding: 20,
    background: "rgba(236,91,19,0.05)",
    border: "1px solid rgba(236,91,19,0.2)",
    borderRadius: 12,
  },
  resultTitle: { fontSize: 16, fontWeight: 700, color: "#ec5b13", margin: "0 0 12px" },
  resultRow: { display: "flex", gap: 8, marginBottom: 6, fontSize: 14, color: "#334155" },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 99,
    fontSize: 11, fontWeight: 700,
    textTransform: "uppercase",
  },
  // Sidebar
  guidelinesCard: {
    background: "#FAF8FC",
    border: "1px solid rgba(236,91,19,0.2)",
    borderRadius: 12, padding: 24,
  },
  guidelinesHeader: {
    display: "flex", alignItems: "center", gap: 8,
    color: "#ec5b13", marginBottom: 16,
  },
  guidelinesTitle: { fontWeight: 700, fontSize: 15, margin: 0, color: "#FF0000" },
  guidelinesList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 },
  guidelinesItem: { display: "flex", gap: 8, fontSize: 13, color: "#475569", alignItems: "flex-start" },
  checkIcon: { color: "#ec5b13", fontSize: 14, marginTop: 1 },
  // Recent Reports
  recentTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" },
  reportCard: {
    background: "#fff", borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    padding: 14, display: "flex", gap: 12, marginBottom: 14,
  },
  reportThumb: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0 },
  reportThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  reportInfo: { flex: 1 },
  reportHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  reportName: { fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 },
  reportMeta: { fontSize: 11, color: "#94a3b8", margin: "4px 0 0" },
  reportAddr: { fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3, marginTop: 6 },
  viewAllBtn: {
    width: "100%", background: "none", border: "none",
    color: "#ec5b13", fontSize: 13, fontWeight: 600,
    cursor: "pointer", marginTop: 4, textDecoration: "underline",
  },
  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0", background: "#fff",
    marginTop: 48, padding: "40px 80px",
  },
  footerInner: {
    maxWidth: 1280, margin: "0 auto",
    display: "flex", flexWrap: "wrap",
    justifyContent: "space-between", alignItems: "center", gap: 16,
  },
  footerBrand: { display: "flex", alignItems: "center", gap: 8 },
  footerLogoSmall: {
    width: 24, height: 24, background: "#ec5b13",
    borderRadius: 4, display: "flex", alignItems: "center",
    justifyContent: "center", color: "#fff", fontSize: 13,
  },
  footerLinks: { display: "flex", gap: 28 },
  footerLink: { color: "#64748b", fontSize: 13, textDecoration: "none" },
  footerCopy: { fontSize: 13, color: "#94a3b8" },
};

// ─── Badge Helper ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const color =
    status === "Fixed" || status === "fixed"
      ? { bg: "#dcfce7", text: "#15803d" }
      : status === "In Progress" || status === "in_progress"
      ? { bg: "#dbeafe", text: "#1d4ed8" }
      : { bg: "#fef9c3", text: "#a16207" };
  return (
    <span style={{ ...styles.badge, background: color.bg, color: color.text }}>
      {status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function IssueForm() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationFreq, setLocationFreq] = useState(null);
  const [category, setCategory] = useState("");
  //const [priority, setPriority] = useState("High");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const token = localStorage.getItem("token");

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ── Image Handling ────────────────────────────────────────────────────────
  const handleImageFile = (file) => {
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageFile(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !description || !lat === null || lng === null) {
      alert("Please upload image, description and detect location");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("location_freq", 1);
    formData.append("lat", lat);
    formData.append("lng", lng);
    //formData.append("category", category);
    //formData.append("priority", priority);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/issues/report-issue",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error submitting issue");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* Bounce keyframe */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;900&display=swap');
        @keyframes bounce {
          0%,100% { transform: translate(-50%,-50%) translateY(0); }
          50% { transform: translate(-50%,-50%) translateY(-6px); }
        }
        .nav-link:hover { color: #ec5b13 !important; }
        .submit-btn:hover:not(:disabled) { background: #1a355b !important; }
        .detect-btn:hover { background: #f8fafc !important; }
        .priority-btn:hover { border-color: rgba(26,53,91,0.4) !important; }
        input:focus, select:focus, textarea:focus {
          border-color: #ec5b13 !important;
          box-shadow: 0 0 0 3px rgba(236,91,19,0.12) !important;
        }
      `}</style>

      {/* ── Header ── */}
      <header style={styles.header}>
      <div style={styles.headerBrand}>
  <div style={styles.headerLogo}>
    <img 
      src={symbol} 
      alt="BiswaBangla Logo" 
      style={styles.logoImage}
    />
  </div>
  <h2 style={styles.headerTitle}>BiswaBangla</h2>
</div>
        <div style={styles.headerNav}>
          {/* use buttons instead of empty anchors for accessibility */}
          <button type="button" className="nav-link" style={styles.navLink}>Home</button>
          <button type="button" className="nav-link" style={styles.navLink}>My Reports</button>
          <button onClick={handleLogout} style={styles.logoutBtn} className="nav-link">
            Logout
          </button>
          <div style={styles.avatar}>
            <div style={{ width: "100%", height: "100%", background: "rgba(255, 255, 255, 1)" , display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Report a City Issue</h1>
          <p style={styles.heroSub}>Help us maintain our community by reporting maintenance or safety concerns.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>

          {/* ── Left: Form ── */}
          <div>
            <div style={styles.card}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Upload Zone */}
                <div>
                  <label style={styles.label}>Upload Photo</label>
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{ ...styles.uploadZone, ...(dragOver ? styles.uploadZoneActive : {}) }}
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={styles.uploadPreview} />
                      ) : (
                        <>
                          <span style={styles.uploadIcon}>📷</span>
                          <p style={styles.uploadLabel}>Click to upload or drag and drop</p>
                          <p style={styles.uploadSub}>PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageFile(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Category + Priority */}
                <div style={styles.fieldGrid} className="issue-form-field-grid">
                  <div style={styles.fieldGroup}>
                    <label style={styles.label} className="issue-form-label">Category</label>
                    <select
                      style={styles.select}
                      className="issue-form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select issue type</option>
                      <option value="pothole">Pothole</option>
                      <option value="street_light">Broken Street Light</option>
                      <option value="litter">Litter / Illegal Dumping</option>
                      <option value="graffiti">Graffiti</option>
                      <option value="water">Water Leakage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* <div style={styles.fieldGroup}>
                    <label style={styles.label}>Priority Level</label>
                    <div style={styles.priorityGroup}>
                      {["Low", "Medium", "High"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className="priority-btn"
                          style={{ ...styles.priorityBtn, ...(priority === lvl ? styles.priorityBtnActive : {}) }}
                          onClick={() => setPriority(lvl)}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div> */}
                </div>

                {/* Location */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Location</label>
                  <div style={styles.locationWrapper}>
                    {/* <span style={styles.locationIcon}>📍</span> */}
                    <input
                      type="text"
                      placeholder="Enter coordinates or autodetect them"
                      style={styles.locationInput}
                      value={locationFreq}
                      onChange={(e) => setLocationFreq(e.target.value)}
                    />
                  </div>
                  <div style={styles.mapPreview}>
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuZfJAwM9IQ1cpWZaNtdT6js79kyedTyS28URGvtKV1raJByMFCvaJZM49355sTAdoCXetW2ZQZN-4QSseE_hbGVkkHitFDfJtKA6R7CtMd-coxRxHmG8G460PfK0kOvmAN2hYqI4_tfNNtKeV4Eek0AD4Hy7fC2LD1OgXz_aDHQPXRoI_Iomo7KbGilxQzqSxGEHHGSGFfjc1_5CP4K3-NApDWZWwX1pVKsfkr508IuMP4Oq33MS8Pv_qk74p97Ka0S2IQswJCJg"
                      alt="Map"
                      style={styles.mapImg}
                    />
                    <div style={styles.mapPin}>📍</div>
                    <button
                      type="button"
                      className="detect-btn"
                      style={styles.detectBtn}
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const latitude = pos.coords.latitude;
                            const longitude = pos.coords.longitude;
                      
                            setLat(latitude);
                            setLng(longitude);
                      
                            // Only for display purpose
                            setLocationFreq(`${latitude}, ${longitude}`);
                          });
                        } else {
                          alert("Geolocation not supported");
                        }
                      }}
                    >
                      Detect My Location
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Problem Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    style={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                  style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
                >
                  {/* <span>📤</span> */}
                  {loading ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>

              {/* Result */}
              {result && (
                <div style={styles.resultCard}>
                  <h3 style={styles.resultTitle}>✅ Issue Reported Successfully</h3>
                  <div style={styles.resultRow}>
                    <strong>Issue Type:</strong>
                    <span style={{ color: "#ec5b13" }}>{result.prediction?.issueType}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <strong>Severity:</strong>
                    <span>{result.prediction?.severity}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <strong>Priority:</strong>
                    <span>{result.prediction?.priority}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <strong>Status:</strong>
                    <StatusBadge status={result.issue?.status} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Guidelines */}
            <div style={styles.guidelinesCard}>
              <div style={styles.guidelinesHeader}>
                <span>ℹ️</span>
                <h3 style={styles.guidelinesTitle}>Reporting Guidelines</h3>
              </div>
              <ul style={styles.guidelinesList}>
                <li style={styles.guidelinesItem}>
                  {/* <span style={styles.checkIcon}>✔</span> */}
                  Provide a clear, well-lit photo of the issue.
                </li>
                <li style={styles.guidelinesItem}>
                  {/* <span style={styles.checkIcon}>✔</span> */}
                  Be specific about the location if GPS is unavailable.
                </li>
                <li style={styles.guidelinesItem}>
                  {/* <span style={styles.checkIcon}>✔</span> */}
                  Report emergencies (gas leaks, fires) directly to 101.
                </li>
              </ul>
            </div>

            {/* Recent Reports */}
            {/* <div>
              <h3 style={styles.recentTitle}>Recent Reports Nearby</h3>

              <div style={styles.reportCard}>
                <div style={styles.reportThumb}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwTwdnhcfLXUV2-X3Tq_JXYEf0-Umu6bks4EcA-yfGITCWI0-5QCD3AK5ZqMdx31Tm1KWlkksop-4VFBedik7jRdM4fIyxthHOomEM30fgYYhVzXLLh5KY0cnMHoKYPePmO2yOiMK7coHNAvBfRD65kT4YFarGT07XC1AbnELSibDqe392HGtyNqYmw5GJVron-gpvS2IIgaXX5e_JQBZGmEvU7q1wgIObDspoUvjEssUnhUHnOhV92J2dl1C19Ke7f33n6QkCtkA"
                    alt="Pothole"
                    style={styles.reportThumbImg}
                  />
                </div>
                <div style={styles.reportInfo}>
                  <div style={styles.reportHeader}>
                    <h4 style={styles.reportName}>Park Street Pothole</h4>
                    <StatusBadge status="Pending" />
                  </div>
                  <p style={styles.reportMeta}>Reported 2 hours ago</p>
                  <p style={styles.reportAddr}>📍 124 Main Street</p>
                </div>
              </div>

              <div style={styles.reportCard}>
                <div style={styles.reportThumb}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuABj33ZXhquLNS_iyQBO06ol54xM_scJrca5P3tzmdYFaDIqGA7mf00D1_QNEB63zk4ykOjx4L8gAf2qpWEAP_gAxVW5Ap8bPHPWeIhI8bsdyX3gIbV92nse5sYaDkQjU-uaQRDfRZrrdlAqhf2qtOUrEEWZ_4xtzHhh4iyA4ZPem6A1a7N6aBDHGZ-COZPoTnGdNKervUn2Od2zAS5WhTdmYQ0604AmDd_cacFHbZ55Xl4M-gf12qJ16KqePw5A8uDSuCFpoZnBfw"
                    alt="Broken Light"
                    style={styles.reportThumbImg}
                  />
                </div>
                <div style={styles.reportInfo}>
                  <div style={styles.reportHeader}>
                    <h4 style={styles.reportName}>Street Light Out</h4>
                    <StatusBadge status="Fixed" />
                  </div>
                  <p style={styles.reportMeta}>Reported yesterday</p>
                  <p style={styles.reportAddr}>📍 Oak Avenue</p>
                </div>
              </div>

              <button style={styles.viewAllBtn}>View All Reports Nearby</button>
            </div> */}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
        <div style={styles.footerBrand}>
  <div style={styles.footerLogo}>
    <img 
      src={symbol} 
      alt="BiswaBangla Logo" 
      style={styles.logoImage}
    />
  </div>
  <h2 style={styles.headerTitle}>BiswaBangla</h2>
</div>
          <div style={styles.footerLinks}>
            <a href="https://abhijaydhar.vercel.app" target="next" style={styles.footerLink}>Made with 💝 and ☕ by Abhijay Dhar</a>
            {/* <a href="#" style={styles.footerLink}>Terms of Service</a>
            <a href="#" style={styles.footerLink}>Contact Support</a> */}
          </div>
          <div style={styles.footerCopy}>© 2026 A Smart Calcutta Initiative</div>
        </div>
      </footer>
    </div>
  );
}

export default IssueForm;

// import React, { useState } from "react";
// import axios from "axios";

// function IssueForm() {
//   const [image, setImage] = useState(null);
//   const [description, setDescription] = useState("");
//   const [locationFreq, setLocationFreq] = useState("");
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("token");

//   // =========================
//   // LOGOUT HANDLER
//   // =========================
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   // =========================
//   // FORM SUBMIT HANDLER
//   // =========================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!image || !description || !locationFreq) {
//       alert("Please fill all fields");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", image);
//     formData.append("description", description);
//     formData.append("location_freq", locationFreq);

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "http://localhost:5000/api/issues/report-issue",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setResult(response.data);
//     } catch (error) {
//       console.error(error);
//       alert("Error submitting issue");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", maxWidth: "500px" }}>
//       {/* LOGOUT BUTTON */}
//       <button onClick={handleLogout} style={{ float: "right" }}>
//         Logout
//       </button>

//       <h2>Smart City Issue Reporting</h2>

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Upload Image:</label><br />
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setImage(e.target.files[0])}
//           />
//         </div>
//         <br />

//         <div>
//           <label>Description:</label><br />
//           <textarea
//             rows="3"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//           />
//         </div>
//         <br />

//         <div>
//           <label>Location Frequency:</label><br />
//           <input
//             type="number"
//             value={locationFreq}
//             onChange={(e) => setLocationFreq(e.target.value)}
//           />
//         </div>
//         <br />

//         <button type="submit" disabled={loading}>
//           {loading ? "Submitting..." : "Report Issue"}
//         </button>
//       </form>

//       {/* RESULT DISPLAY */}
//       {result && (
//         <div style={{ marginTop: "20px" }}>
//           <h3>Issue Reported Successfully</h3>
//           <p><b>Issue Type:</b> {result.prediction.issueType}</p>
//           <p><b>Severity:</b> {result.prediction.severity}</p>
//           <p><b>Priority:</b> {result.prediction.priority}</p>
//           <p><b>Status:</b> {result.issue.status}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default IssueForm;