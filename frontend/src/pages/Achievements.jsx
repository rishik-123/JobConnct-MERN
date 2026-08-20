import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { Award, Plus, UploadCloud, AlertCircle, FileText, CheckCircle } from "lucide-react";

export default function Achievements() {
  const { token } = useContext(AuthContext);
  const [achievements, setAchievements] = useState([]);
  const [type, setType] = useState("");
  const [numberOfAch, setNumberOfAch] = useState("1");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const loadAchievements = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) {
      setError("Please specify the achievement type.");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("numberofachievements", numberOfAch);
    if (file) {
      formData.append("resume", file); // multer single("resume")
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/achievements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setType("");
        setNumberOfAch("1");
        setFile(null);
        // Reload list
        loadAchievements();
      } else {
        setError(data.error || "Failed to post achievement.");
      }
    } catch (err) {
      console.error(err);
      setError("Error occurred during achievement submission.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={48} style={{ color: "var(--accent-red)", marginBottom: "20px" }} />
        <h2>Authentication Required</h2>
        <p style={{ color: "var(--text-grey)", marginTop: "8px" }}>Please login or register to view or upload achievements.</p>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <div className="network-header">
        <h1>Track Achievements</h1>
        <p>Document your awards, credentials, certificates, and coding accomplishments</p>
      </div>

      <div className="dashboard-grid">
        {/* POST FORM */}
        <div className="profile-sidebar" style={{ textAlign: "left" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={20} style={{ color: "var(--accent-gold)" }} /> Post Achievement
          </h3>

          {success && (
            <div className="file-selected-alert" style={{ background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.3)", color: "#c7ffd4", marginBottom: "20px" }}>
              <CheckCircle size={16} />
              <span>Achievement saved!</span>
            </div>
          )}

          {error && (
            <div className="file-selected-alert" style={{ background: "rgba(255, 74, 90, 0.1)", border: "1px solid rgba(255, 74, 90, 0.3)", color: "#ffb3b8", marginBottom: "20px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Achievement Type / Name</label>
              <input
                type="text"
                placeholder="e.g. Hackathon Winner, Azure Core Certificate"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Number of Achievements / Count</label>
              <input
                type="number"
                min="1"
                required
                value={numberOfAch}
                onChange={(e) => setNumberOfAch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Attachment Proof (Certificate / Image)</label>
              <div
                style={{
                  border: "1px dashed var(--border-card)",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "rgba(255,255,255,0.02)"
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <UploadCloud size={28} style={{ color: "var(--accent-gold)", margin: "0 auto 8px auto" }} />
                <span style={{ fontSize: "13px", color: "var(--text-grey)", display: "block" }}>Click to upload file</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              {file && (
                <div className="file-selected-alert" style={{ background: "rgba(255, 185, 71, 0.05)", border: "1px solid rgba(255, 185, 71, 0.2)", color: "#ffe7bc", marginTop: "12px", fontSize: "12px" }}>
                  <FileText size={14} />
                  <span>Selected: {file.name}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
              {loading ? "Saving..." : "Post Achievement"}
            </button>
          </form>
        </div>

        {/* ACHIEVEMENTS GRID LIST */}
        <div className="dashboard-panels">
          <div className="panel-card">
            <h3>Uploaded Achievements</h3>

            {achievements.length === 0 ? (
              <div className="empty-state">
                <p>No achievements posted yet. Upload your first cert to display it here!</p>
              </div>
            ) : (
              <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {achievements.map((ach) => (
                  <div key={ach._id} className="feature-card" style={{ gap: "12px", padding: "20px", width: "100%" }}>
                    <div className="card-icon" style={{ width: "40px", height: "40px" }}>
                      <Award size={20} />
                    </div>
                    <h4 style={{ fontSize: "16px", marginTop: "4px" }}>{ach.type}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-grey)" }}>
                      Count: {ach.numberofachievements}
                    </p>
                    {ach.filepath && (
                      <a
                        href={`${BACKEND_URL}/uploads/${ach.filepath}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "var(--accent-teal)",
                          textDecoration: "none",
                          fontWeight: "600",
                          marginTop: "8px",
                          display: "inline-flex",
                          align-items: "center",
                          gap: "4px"
                        }}
                      >
                        <FileText size={12} /> View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
