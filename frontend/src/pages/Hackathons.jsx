import React, { useState, useEffect, useContext } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { Code2, Calendar, FolderGit, Sparkles } from "lucide-react";

export default function Hackathons() {
  const { token, user } = useContext(AuthContext);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const loadHackathons = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/hackathons`);
      if (res.ok) {
        const data = await res.json();
        setHackathons(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleApply = async (hackathonId, title) => {
    if (!token) {
      alert("Please login first to apply for hackathons.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/hackathons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hackathonId })
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(`Successfully registered for ${title}!`);
        loadHackathons(); // reload applicants list
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        alert(data.error || "Failed to apply.");
      }
    } catch (err) {
      console.error(err);
      alert("Error applying to hackathon.");
    }
  };

  return (
    <div className="hackathons-page">
      <div className="network-header">
        <h1>Upcoming Hackathons</h1>
        <p>Build real-world prototypes, learn new tech, and showcase skills to recruiters</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-grey)" }}>Loading hackathons...</p>
      ) : hackathons.length === 0 ? (
        <div className="empty-state">
          <p>No hackathons posted yet. Check back soon!</p>
        </div>
      ) : (
        <div className="hackathon-list">
          {hackathons.map((h) => {
            const hasApplied = user && h.applicants && h.applicants.includes(user.id);

            return (
              <div key={h._id} className="hackathon-card">
                <div className="hackathon-info">
                  <h3>{h.title}</h3>
                  <div className="hackathon-meta">
                    <span>
                      <Calendar size={14} style={{ color: "var(--accent-gold)" }} />
                      <strong>Date:</strong> {h.date}
                    </span>
                    <span>
                      <FolderGit size={14} style={{ color: "var(--accent-teal)" }} />
                      <strong>Theme:</strong> {h.theme}
                    </span>
                  </div>
                  <p>{h.description}</p>
                </div>

                <button
                  onClick={() => handleApply(h._id, h.title)}
                  disabled={hasApplied}
                  className="btn-primary"
                  style={{
                    backgroundColor: hasApplied ? "rgba(255, 255, 255, 0.05)" : "var(--accent-gold)",
                    color: hasApplied ? "var(--text-grey)" : "#000",
                    border: hasApplied ? "1px solid var(--border-card)" : "none",
                    boxShadow: hasApplied ? "none" : "0 4px 20px rgba(255, 185, 71, 0.2)",
                    cursor: hasApplied ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {hasApplied ? "Registered" : "Apply Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          <Sparkles size={18} style={{ color: "var(--accent-gold)" }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
