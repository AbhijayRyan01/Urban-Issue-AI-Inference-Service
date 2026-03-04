import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import symbol from "./assets/symbol.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "register-citizen" | "register-admin"
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f1f5f9;
        overflow: auto;
      }

      .login-wrapper {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: clamp(12px, 5vw, 40px);
        overflow-y: auto;
      }

      .login-container {
        width: 100%;
        max-width: 500px;
        text-align: center;
      }

      .logo-box {
        margin-bottom: clamp(20px, 6vw, 30px);
      }

      .logo-icon {
        width: clamp(50px, 15vw, 60px);
        height: clamp(50px, 15vw, 60px);
        margin: 0 auto clamp(12px, 4vw, 15px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-img {
        width: clamp(50px, 15vw, 60px);
        height: clamp(50px, 15vw, 60px);
        object-fit: contain;
        border-radius: 10px;
      }

      .logo-box h1 {
        font-size: clamp(16px, 6vw, 22px);
        font-weight: 700;
        color: #1a355b;
        margin: 0;
        line-height: 1.3;
      }

      .logo-box p {
        font-size: clamp(12px, 3vw, 13px);
        color: #64748b;
        margin-top: 6px;
        line-height: 1.4;
      }

      .login-card {
        background: #ffffff;
        padding: clamp(20px, 5vw, 35px);
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        text-align: left;
      }

      /* Tab Toggle */
      .tab-toggle {
        display: flex;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        margin-bottom: clamp(16px, 4vw, 22px);
        background: #f8fafc;
      }

      .tab-btn {
        flex: 1;
        padding: clamp(8px, 2.5vw, 11px) 6px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: clamp(11px, 2.5vw, 13px);
        font-weight: 600;
        color: #94a3b8;
        transition: all 0.2s ease;
        font-family: inherit;
        white-space: nowrap;
      }

      .tab-btn.active {
        background: #1a355b;
        color: #ffffff;
      }

      .tab-btn:hover:not(.active) {
        background: #e2e8f0;
        color: #475569;
      }

      /* Register Role Selector */
      .role-selector {
        display: flex;
        gap: 10px;
        margin-bottom: clamp(14px, 4vw, 20px);
      }

      .role-card {
        flex: 1;
        padding: clamp(10px, 3vw, 14px);
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        background: #f8fafc;
      }

      .role-card.selected {
        border-color: #1a355b;
        background: #eef2f8;
      }

      .role-card .role-icon {
        font-size: clamp(20px, 5vw, 26px);
        margin-bottom: 5px;
      }

      .role-card .role-label {
        font-size: clamp(11px, 2.5vw, 13px);
        font-weight: 600;
        color: #1a355b;
      }

      .role-card .role-desc {
        font-size: clamp(9px, 2vw, 11px);
        color: #64748b;
        margin-top: 3px;
      }

      /* Form */
      .form-group {
        margin-bottom: clamp(14px, 4vw, 18px);
      }

      .form-group label {
        display: block;
        font-size: clamp(12px, 3vw, 14px);
        font-weight: 600;
        margin-bottom: 6px;
        color: #334155;
      }

      .form-group input {
        width: 100%;
        padding: clamp(9px, 3vw, 12px) clamp(10px, 3vw, 14px);
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        font-size: clamp(13px, 3vw, 14px);
        font-family: inherit;
        transition: 0.2s ease;
        box-sizing: border-box;
      }

      .form-group input:focus {
        outline: none;
        border-color: #1a355b;
        box-shadow: 0 0 0 2px rgba(26,53,91,0.15);
      }

      .utilities {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        font-size: clamp(11px, 3vw, 13px);
        margin-bottom: clamp(14px, 4vw, 20px);
      }

      .utilities a {
        color: #1a355b;
        text-decoration: none;
        font-weight: 500;
      }

      .utilities a:hover {
        text-decoration: underline;
      }

      .submit-btn {
        width: 100%;
        padding: clamp(10px, 3vw, 12px);
        background: #1a355b;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: clamp(13px, 3vw, 14px);
        cursor: pointer;
        transition: 0.3s ease;
        font-family: inherit;
      }

      .submit-btn:hover {
        background: #122642;
      }

      .submit-btn:active {
        opacity: 0.9;
      }

      .submit-btn:disabled {
        background: #94a3b8;
        cursor: not-allowed;
      }

      /* Badge for admin warning */
      .admin-warning {
        background: #fef9c3;
        border: 1px solid #fde047;
        border-radius: 6px;
        padding: clamp(8px, 2.5vw, 11px) clamp(10px, 3vw, 14px);
        font-size: clamp(10px, 2.5vw, 12px);
        color: #713f12;
        margin-bottom: clamp(12px, 3vw, 16px);
        display: flex;
        gap: 7px;
        align-items: flex-start;
      }

      .security-note {
        margin-top: clamp(16px, 5vw, 25px);
        padding-top: clamp(16px, 4vw, 20px);
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: clamp(10px, 2vw, 11px);
        color: #64748b;
        letter-spacing: 1px;
      }

      .success-msg {
        background: #dcfce7;
        border: 1px solid #86efac;
        border-radius: 6px;
        padding: clamp(8px, 2.5vw, 11px) clamp(10px, 3vw, 14px);
        font-size: clamp(11px, 2.5vw, 13px);
        color: #166534;
        margin-bottom: clamp(12px, 3vw, 16px);
        text-align: center;
      }

      .error-msg {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        border-radius: 6px;
        padding: clamp(8px, 2.5vw, 11px) clamp(10px, 3vw, 14px);
        font-size: clamp(11px, 2.5vw, 13px);
        color: #991b1b;
        margin-bottom: clamp(12px, 3vw, 16px);
        text-align: center;
      }

      @media (max-width: 480px) {
        .login-wrapper { padding: 16px; overflow-y: auto; }
        .login-card { padding: 20px; }
        .logo-box h1 { word-break: break-word; }
      }

      @media (min-width: 481px) and (max-width: 1024px) {
        .login-wrapper { padding: 30px 20px; }
        .login-card { padding: 30px; }
      }

      @media (min-width: 1025px) {
        .login-wrapper { padding: 40px; }
        .login-card { padding: 35px; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [registerRole, setRegisterRole] = useState("citizen"); // "citizen" | "admin"
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const resetRegForm = () => {
    setRegName(""); setRegEmail(""); setRegPassword(""); setRegConfirm("");
    setFeedback({ type: "", msg: "" });
  };

  const handleTabSwitch = (tab) => {
    setMode(tab);
    setFeedback({ type: "", msg: "" });
    resetRegForm();
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", msg: "" });
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setFeedback({ type: "error", msg: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", msg: "" });

    if (regPassword !== regConfirm) {
      setFeedback({ type: "error", msg: "Passwords do not match." });
      return;
    }
    if (regPassword.length < 6) {
      setFeedback({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: registerRole,
      });
      setFeedback({ type: "success", msg: `${registerRole === "admin" ? "Admin" : "Citizen"} account created! You can now log in.` });
      resetRegForm();
      setTimeout(() => handleTabSwitch("login"), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      setFeedback({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        {/* Logo Section */}
        <div className="logo-box">
          <div className="logo-icon">
            <img src={symbol} alt="BiswaBangla Logo" className="logo-img" />
          </div>
          <h1>Calcutta Re-Imagined: A Smart Civic Revolution</h1>
          <p>An Engineer's Quiet Resolve to Rebuild the Kolkata He Never Stopped Loving</p>
        </div>

        {/* Card */}
        <div className="login-card">

          {/* Tab Toggle */}
          <div className="tab-toggle">
            <button
              className={`tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => handleTabSwitch("login")}
            >
              🔑 Login
            </button>
            <button
              className={`tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => handleTabSwitch("register")}
            >
              📝 Register
            </button>
          </div>

          {/* Feedback Messages */}
          {feedback.msg && (
            <div className={feedback.type === "success" ? "success-msg" : "error-msg"}>
              {feedback.type === "success" ? "✅ " : "⚠️ "}{feedback.msg}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@city.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="utilities">
                <div><input type="checkbox" /> Remember me</div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Logging in…" : "🔒 Log In to Dashboard"}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister}>

              {/* Role Selector */}
              <div className="role-selector">
                <div
                  className={`role-card ${registerRole === "citizen" ? "selected" : ""}`}
                  onClick={() => { setRegisterRole("citizen"); setFeedback({ type: "", msg: "" }); }}
                >
                  <div className="role-icon">🏙️</div>
                  <div className="role-label">Citizen</div>
                  <div className="role-desc">Report civic issues</div>
                </div>
                <div
                  className={`role-card ${registerRole === "admin" ? "selected" : ""}`}
                  onClick={() => { setRegisterRole("admin"); setFeedback({ type: "", msg: "" }); }}
                >
                  <div className="role-icon">🛡️</div>
                  <div className="role-label">Admin</div>
                  <div className="role-desc">Manage & resolve issues</div>
                </div>
              </div>

              {/* Admin caution banner */}
              {registerRole === "admin" && (
                <div className="admin-warning">
                  ⚠️ Admin accounts have elevated access. Only authorised municipal personnel should register as Admin.
                </div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  placeholder={registerRole === "admin" ? "admin@city.gov" : "you@example.com"}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading
                  ? "Registering…"
                  : registerRole === "admin"
                  ? "🛡️ Register as Admin"
                  : "🏙️ Register as Citizen"}
              </button>

            </form>
          )}

          <div className="security-note">
            Secure SSL Encrypted Connection
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;