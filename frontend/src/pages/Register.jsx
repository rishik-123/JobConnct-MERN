import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AlertCircle, User as UserIcon, Mail, Lock, Briefcase, Phone } from "lucide-react";

export default function Register() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [jobProfile, setJobProfile] = useState("");
  const [contactno, setContactno] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        clientnamefirst: fname,
        clientnamelast: lname,
        JobProfile: jobProfile,
        contactno: contactno,
        exampleInputEmail1: email,
        exampleInputPassword1: password
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="glass-card" style={{ maxWidth: "580px" }}>
        <h2>Create an Account</h2>
        <p className="subtitle">Join today to start your career journey</p>

        {error && (
          <div className="file-selected-alert" style={{ background: "rgba(255, 74, 90, 0.1)", border: "1px solid rgba(255, 74, 90, 0.3)", color: "#ffb3b8", marginBottom: "20px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <div style={{ position: "relative" }}>
                <UserIcon size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
                <input
                  type="text"
                  required
                  style={{ paddingLeft: "44px" }}
                  placeholder="John"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <div style={{ position: "relative" }}>
                <UserIcon size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
                <input
                  type="text"
                  required
                  style={{ paddingLeft: "44px" }}
                  placeholder="Doe"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Profile</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
                <input
                  type="text"
                  style={{ paddingLeft: "44px" }}
                  placeholder="Student, Developer..."
                  value={jobProfile}
                  onChange={(e) => setJobProfile(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
                <input
                  type="tel"
                  style={{ paddingLeft: "44px" }}
                  placeholder="9876543210"
                  value={contactno}
                  onChange={(e) => setContactno(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "16px", color: "var(--text-grey)" }} />
              <input
                type="email"
                required
                style={{ paddingLeft: "44px" }}
                placeholder="john.doe@example.com"
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
            {loading ? "Creating account..." : "Submit"}
          </button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/login">Click to Login</Link>
        </p>
      </div>
    </div>
  );
}
