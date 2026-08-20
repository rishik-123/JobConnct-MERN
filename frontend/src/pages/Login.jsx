import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="glass-card">
        <h2>Login</h2>
        <p className="subtitle">Sign in to connect with peers and opportunities</p>

        {error && (
          <div className="file-selected-alert" style={{ background: "rgba(255, 74, 90, 0.1)", border: "1px solid rgba(255, 74, 90, 0.3)", color: "#ffb3b8", marginBottom: "20px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
              <input
                type="email"
                required
                style={{ paddingLeft: "44px" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
              <input
                type="password"
                required
                style={{ paddingLeft: "44px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Create an Account</Link>
        </p>
      </div>
    </div>
  );
}
