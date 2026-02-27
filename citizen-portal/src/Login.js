import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import symbol from "./assets/symbol.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f1f5f9;
        overflow: hidden;
      }

      .login-wrapper {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .login-container {
        width: 100%;
        max-width: 500px;
        text-align: center;
      }

      /* Logo Section */
      .logo-box {
        margin-bottom: 30px;
      }

      .logo-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-img {
        width: 60px;
        height: 60px;
        object-fit: contain;
        border-radius: 10px;
      }

      .logo-box h1 {
        font-size: 22px;
        font-weight: 700;
        color: #1a355b;
        margin: 0;
      }

      .logo-box p {
        font-size: 13px;
        color: #64748b;
        margin-top: 6px;
      }

      /* Login Card */
      .login-card {
        background: #ffffff;
        padding: 35px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        text-align: left;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #334155;
      }

      .form-group input {
        width: 100%;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        font-size: 14px;
        transition: 0.2s ease;
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
        font-size: 13px;
        margin-bottom: 20px;
      }

      .utilities a {
        color: #1a355b;
        text-decoration: none;
        font-weight: 500;
      }

      .utilities a:hover {
        text-decoration: underline;
      }

      .login-btn {
        width: 100%;
        padding: 12px;
        background: #1a355b;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.3s ease;
      }

      .login-btn:hover {
        background: #122642;
      }

      .security-note {
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        letter-spacing: 1px;
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 25px;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      alert("Invalid credentials");
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
          <h1>Calcutta Reimagined: A Smart Civic Revolution</h1>
          <p>An Engineer’s Quiet Resolve to Rebuild the Kolkata He Never Stopped Loving</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit}>

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
              <div>
                <input type="checkbox" /> Remember me
              </div>
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn">
              🔒 Log In to Dashboard
            </button>

          </form>

          <div className="security-note">
            Secure SSL Encrypted Connection
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;