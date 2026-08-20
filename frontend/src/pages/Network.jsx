import React, { useState, useEffect, useContext } from "react";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { User, UserCheck, Search, ShieldAlert, Sparkles } from "lucide-react";

export default function Network() {
  const { token, user, setUser } = useContext(AuthContext);
  const [peers, setPeers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const loadNetwork = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/network`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPeers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
  }, [token]);

  const handleConnect = async (peerId, peerName) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/network/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ peerId })
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(`You are now connected with ${peerName}!`);
        // Sync local user connections state
        if (user) {
          const updatedConnections = [...(user.connections || []), peerId];
          setUser({ ...user, connections: updatedConnections });
        }
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        alert(data.error || "Failed to connect.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting with peer.");
    }
  };

  const filteredPeers = peers.filter(peer => {
    const fullName = `${peer.fname || ""} ${peer.lname || ""}`.toLowerCase();
    const job = (peer.jobProfile || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || job.includes(query);
  });

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <ShieldAlert size={48} style={{ color: "var(--accent-red)", marginBottom: "20px" }} />
        <h2>Authentication Required</h2>
        <p style={{ color: "var(--text-grey)", marginTop: "8px" }}>Please login or register to see other peers on the network.</p>
      </div>
    );
  }

  return (
    <div className="network-page">
      <div className="network-header">
        <h1>Connect with Peers</h1>
        <p>Build your professional network and find potential colleagues</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
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
            placeholder="Search peers by name or profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-grey)" }}>Loading peers...</p>
      ) : filteredPeers.length === 0 ? (
        <div className="empty-state">
          <p>No peers found matching "{search}".</p>
        </div>
      ) : (
        <div className="peers-grid">
          {filteredPeers.map(peer => {
            const peerIdStr = peer._id.toString();
            // Check connection list in context user object
            const isConnected = user?.connections?.some(conn => {
              const connIdStr = typeof conn === "object" ? conn._id.toString() : conn.toString();
              return connIdStr === peerIdStr;
            });

            return (
              <div key={peer._id} className="peer-card">
                <div className="peer-avatar">
                  <User size={40} />
                </div>
                <h3>{peer.fname} {peer.lname}</h3>
                <p className="peer-title">{peer.jobProfile}</p>
                <p className="peer-email">{peer.email}</p>

                <div className="peer-skills">
                  {(peer.skills && peer.skills.length > 0) ? (
                    peer.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="tag">{skill}</span>
                    ))
                  ) : (
                    <span className="tag">Web Development</span>
                  )}
                </div>

                <button
                  onClick={() => handleConnect(peer._id, `${peer.fname} ${peer.lname}`)}
                  disabled={isConnected}
                  className="btn-connect"
                  style={{
                    backgroundColor: isConnected ? "rgba(255, 255, 255, 0.05)" : "var(--text-white)",
                    color: isConnected ? "var(--text-grey)" : "#000",
                    border: isConnected ? "1px solid var(--border-card)" : "none",
                    cursor: isConnected ? "not-allowed" : "pointer"
                  }}
                >
                  {isConnected ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <UserCheck size={14} /> Connected
                    </span>
                  ) : (
                    "Connect"
                  )}
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
