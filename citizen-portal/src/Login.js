import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
        height: 140vh;
        overflow: hidden;
      }

      .login-wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 40px 20px;
      }

      .login-container {
        width: 100%;
        max-width: 640px;
      }

      .logo-box {
        text-align: center;
        margin-bottom: 40px;
      }

      .logo-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        background: #1a355b;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        margin-bottom: 10px;
      }

      .logo-icon svg {
        width: 40px;
        height: 40px;
        fill: white;
      }

      .logo-box h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a355b;
        margin: 0;
      }

      .logo-box p {
        font-size: 14px;
        color: #6b7280;
        margin-top: 8px;
      }

      .login-card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 6px;
        color: #374151;
      }

      .input-wrapper {
        position: relative;
      }

      .input-wrapper svg {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        width: 12px;
        height: 18px;
        stroke: #9ca3af;
      }

      .form-group input {
        width: 90%;
        padding: 12px 12px 12px 12px;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        font-size: 14px;
        transition: 0.2s ease;
      }

      .form-group input:focus {
        outline: none;
        border-color: #1a355b;
        box-shadow: 0 0 0 2px rgba(26,53,91,0.2);
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
        color: #3b82f6;
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
        border-top: 1px solid #f1f5f9;
        text-align: center;
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      footer {
        text-align: center;
        margin-top: 40px;
      }

      footer nav {
        margin-bottom: 10px;
      }

      footer nav a {
        margin: 0 10px;
        font-size: 13px;
        color: #6b7280;
        text-decoration: none;
      }

      footer nav a:hover {
        color: #1a355b;
      }

      footer p {
        font-size: 11px;
        color: #9ca3af;
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 20px;
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
      <main className="login-container">

        <div className="logo-box">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1>Smart Calcutta Municipal System</h1>
          <p>An Engineer's Initiative</p>
        </div>

        <section className="login-card">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  required
                  placeholder="admin@city.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
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
        </section>

      </main>

      {/* <footer>
        <nav>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </nav> */}
        {/* <p>© 2026 Smart Civic System. All rights reserved.</p> */}
      {/* </footer> */}
    </div>
  );
}

export default Login;