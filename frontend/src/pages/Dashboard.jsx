import React, { useState, useEffect, useContext } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { User, Share2, Briefcase, FileText, Award, AlertCircle, Calendar } from "lucide-react";

export default function Dashboard() {
  const { token, user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setUser(data); // Sync globally
      }
    } catch (err) {
      console.error("Fetch profile details error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <AlertCircle size={48} style={{ color: "var(--accent-red)", marginBottom: "20px" }} />
        <h2>Authentication Required</h2>
        <p style={{ color: "var(--text-grey)", marginTop: "8px" }}>Please login or register to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center", color: "var(--text-grey)", padding: "60px" }}>Loading dashboard...</p>;
  }

  const userProfile = profile || user;

  return (
    <div className="dashboard-page">
      <div className="network-header">
        <h1>Your Portfolio Dashboard</h1>
        <p>Monitor your skills profile, professional peers, achievements, and customized matched jobs</p>
      </div>

      <div className="dashboard-grid">
        {/* SIDEBAR PROFILE SUMMARY */}
        <div className="profile-sidebar">
          <div className="profile-card-header">
            <div className="dashboard-avatar">
              <User size={48} />
            </div>
            <h2>{userProfile?.fname} {userProfile?.lname}</h2>
            <span className="job">{userProfile?.jobProfile}</span>
          </div>

          <div style={{ textAlign: "left" }}>
            <div className="profile-detail-item">
              <span>Email</span>
              <span>{userProfile?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span>Contact</span>
              <span>{userProfile?.contactnumber || "N/A"}</span>
            </div>
            <div className="profile-detail-item">
              <span>Role</span>
              <span style={{ textTransform: "capitalize", fontWeight: "700" }}>{userProfile?.role}</span>
            </div>
            <div className="profile-detail-item">
              <span>Connections</span>
              <span>{userProfile?.connections?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* PANELS */}
        <div className="dashboard-panels">
          {/* SKILL PROFILE */}
          <div className="panel-card">
            <h3>
              <FileText size={20} style={{ color: "var(--accent-gold)" }} /> Skill Profile & Resume
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>RESUME FILE:</strong>
              {userProfile?.resumePath ? (
                <a
                  href={`${BACKEND_URL}/uploads/${userProfile.resumePath}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--accent-gold)",
                    textDecoration: "none",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 185, 71, 0.05)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--accent-gold-muted)"
                  }}
                >
                  <FileText size={16} /> View Uploaded Resume File
                </a>
              ) : (
                <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No resume uploaded yet. Go upload it to start matching.</span>
              )}
            </div>

            <div>
              <strong style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>TECH SKILLSET TAGS:</strong>
              <div className="skills-tags-container">
                {userProfile?.skills && userProfile.skills.length > 0 ? (
                  userProfile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag" style={{ paddingRight: "12px" }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No skills added. Add skills in the Upload Resume tab.</span>
                )}
              </div>
            </div>
          </div>

          {/* ADMIN RECOMMENDED JOBS */}
          <div className="panel-card">
            <h3>
              <Briefcase size={20} style={{ color: "var(--accent-teal)" }} /> Direct Job Matches
            </h3>

            {!userProfile?.recommendations || userProfile.recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No job recommendations matched yet. The administrator will match opportunities to you based on your uploaded skills profile soon!</p>
              </div>
            ) : (
              <div>
                {userProfile.recommendations.map((rec, index) => (
                  <div key={index} className="rec-card">
                    <div className="rec-header">
                      <h4>{rec.title}</h4>
                      <span style={{ fontSize: "12px", color: "var(--text-grey)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {new Date(rec.recommendedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rec-company" style={{ color: "var(--accent-teal)" }}>{rec.company}</div>
                    <p style={{ marginTop: "8px" }}>{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PEER NETWORK DETAILS */}
          <div className="panel-card">
            <h3>
              <Share2 size={20} style={{ color: "var(--accent-gold)" }} /> Connected Colleagues
            </h3>

            {!userProfile?.connections || userProfile.connections.length === 0 ? (
              <div className="empty-state">
                <p>You haven't established connections yet. Check the Network page to connect with peers.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {userProfile.connections.map((conn) => (
                  <div
                    key={conn._id || conn}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "14px",
                      padding: "16px",
                      textAlign: "center"
                    }}
                  >
                    <div className="peer-avatar" style={{ width: "50px", height: "50px", border: "2px solid var(--accent-teal)", marginBottom: "10px" }}>
                      <User size={22} />
                    </div>
                    <h5 style={{ fontSize: "14px" }}>
                      {typeof conn === "object" ? `${conn.fname} ${conn.lname}` : "Connected Peer"}
                    </h5>
                    <p style={{ fontSize: "12px", color: "var(--accent-gold)", marginTop: "2px" }}>
                      {typeof conn === "object" ? conn.jobProfile : ""}
                    </p>
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
