import React, { useState, useEffect, useContext } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { Plus, Award, Briefcase, FileText, Search, UserCheck, X, Check, Sparkles } from "lucide-react";

export default function AdminPanel() {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Hackathon form states
  const [hackTitle, setHackTitle] = useState("");
  const [hackTheme, setHackTheme] = useState("");
  const [hackDate, setHackDate] = useState("");
  const [hackDesc, setHackDesc] = useState("");
  const [hackSuccess, setHackSuccess] = useState(false);

  // Recommendation Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [recSuccess, setRecSuccess] = useState("");

  const loadUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadUsers();
    }
  }, [user]);

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    setHackSuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/hackathons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: hackTitle,
          theme: hackTheme,
          date: hackDate,
          description: hackDesc
        })
      });

      if (res.ok) {
        setHackSuccess(true);
        setHackTitle("");
        setHackTheme("");
        setHackDate("");
        setHackDesc("");
        setTimeout(() => setHackSuccess(false), 3000);
      } else {
        alert("Failed to create hackathon.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommendJob = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setRecSuccess("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/recommend-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          title: jobTitle,
          company: jobCompany,
          description: jobDesc
        })
      });

      if (res.ok) {
        setRecSuccess("Job recommended successfully!");
        setJobTitle("");
        setJobCompany("");
        setJobDesc("");
        loadUsers(); // reload user lists
        setTimeout(() => {
          setRecSuccess("");
          setSelectedUser(null);
        }, 2000);
      } else {
        alert("Failed to send recommendation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic compatibility helper based on matching keywords in skill array vs job title
  const calculateCompatibility = (userSkills, titleInput) => {
    if (!userSkills || userSkills.length === 0 || !titleInput) return 0;
    const cleanTitle = titleInput.toLowerCase();
    let matches = 0;
    userSkills.forEach(s => {
      if (cleanTitle.includes(s.toLowerCase())) matches++;
    });
    const percentage = Math.round((matches / userSkills.length) * 100);
    return percentage > 100 ? 100 : percentage === 0 ? 15 : percentage; // default base 15% compatibility
  };

  if (!user || user.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Access Denied</h2>
        <p style={{ color: "var(--text-grey)", marginTop: "8px" }}>This area is reserved for administrators only.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const fullName = `${u.fname || ""} ${u.lname || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="admin-page">
      <div className="network-header">
        <h1>Admin Control Center</h1>
        <p>Manage hackathons and direct match job opportunities based on peer skillsets</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Skills & Matching
        </button>
        <button
          className={`tab-btn ${activeTab === "hackathon" ? "active" : ""}`}
          onClick={() => setActiveTab("hackathon")}
        >
          Publish Hackathon
        </button>
      </div>

      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
              <Search size={18} style={{ position: "absolute", left: "16px", top: "16px", color: "var(--text-grey)" }} />
              <input
                type="text"
                className="search-input"
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 48px",
                  borderRadius: "14px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-card)",
                  color: "var(--text-white)",
                  outline: "none"
                }}
                placeholder="Search registered users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--text-grey)" }}>Loading users...</p>
          ) : (
            <div className="admin-users-list">
              {filteredUsers.map(u => (
                <div key={u._id} className="admin-user-card">
                  <div className="admin-user-info">
                    <h4>{u.fname} {u.lname} <span style={{ fontSize: "11px", color: "var(--text-grey)" }}>({u.role})</span></h4>
                    <p style={{ color: "var(--accent-teal)" }}>{u.jobProfile} &bull; {u.email}</p>
                    <p style={{ marginTop: "6px" }}>
                      <strong>Skills:</strong>{" "}
                      {u.skills && u.skills.length > 0 ? (
                        u.skills.join(", ")
                      ) : (
                        <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>None specified</span>
                      )}
                    </p>
                    {u.resumePath && (
                      <p style={{ marginTop: "4px" }}>
                        <a
                          href={`${BACKEND_URL}/uploads/${u.resumePath}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--accent-gold)",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "13px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <FileText size={14} /> View Uploaded Resume
                        </a>
                      </p>
                    )}
                  </div>

                  {u.role !== "admin" && (
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="match-opportunities-btn"
                    >
                      <Briefcase size={16} /> Match Job
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "hackathon" && (
        <div className="glass-card" style={{ margin: "0 auto", padding: "30px" }}>
          <h3>Publish a New Hackathon</h3>
          <p className="subtitle" style={{ marginBottom: "24px" }}>Fill out details to publish a new challenge globally</p>

          {hackSuccess && (
            <div className="file-selected-alert" style={{ background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.3)", color: "#c7ffd4", marginBottom: "20px" }}>
              <Check size={16} />
              <span>Hackathon published successfully!</span>
            </div>
          )}

          <form onSubmit={handleCreateHackathon}>
            <div className="form-group">
              <label>Hackathon Name</label>
              <input
                type="text"
                required
                value={hackTitle}
                onChange={(e) => setHackTitle(e.target.value)}
                placeholder="e.g. Smart India Hackathon"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Theme</label>
                <input
                  type="text"
                  required
                  value={hackTheme}
                  onChange={(e) => setHackTheme(e.target.value)}
                  placeholder="e.g. GenAI, Blockchain"
                />
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="text"
                  required
                  value={hackDate}
                  onChange={(e) => setHackDate(e.target.value)}
                  placeholder="e.g. 25 Feb 2025"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description & Scope</label>
              <textarea
                rows="4"
                required
                value={hackDesc}
                onChange={(e) => setHackDesc(e.target.value)}
                placeholder="Explain the hackathon statement, guidelines, and pricing awards..."
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Publish Challenge
            </button>
          </form>
        </div>
      )}

      {/* MATCH JOB OPPORTUNITY MODAL */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Match Job for {selectedUser.fname} {selectedUser.lname}</h3>
              <button className="close-modal" onClick={() => setSelectedUser(null)}>
                <X size={24} />
              </button>
            </div>

            {recSuccess && (
              <div className="file-selected-alert" style={{ background: "rgba(0, 230, 118, 0.1)", border: "1px solid rgba(0, 230, 118, 0.3)", color: "#c7ffd4", marginBottom: "20px" }}>
                <Check size={16} />
                <span>{recSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecommendJob}>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  rows="3"
                  placeholder="Responsibilities, required background, tech stack details..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>

              {jobTitle && (
                <div style={{ marginBottom: "20px" }}>
                  <span className="compatibility-pill">
                    <Sparkles size={13} />
                    Skill Compatibility Match Score: {calculateCompatibility(selectedUser.skills, jobTitle)}%
                  </span>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                Send Matching Recommendation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
