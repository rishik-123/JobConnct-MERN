import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { Trophy, FileText, Share2, Award, Check, Sparkles, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubscribe = async (plan) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe error: " + (data.error || "Could not launch checkout"));
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating payment checkout.");
    }
  };

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-badge">
          <Sparkles size={14} /> Zero-G Career Elevation Platform
        </div>
        <h1>Welcome to JobConnect Pro</h1>
        <p>Your Ultimate Guide to High-Impact Job Opportunities, Technical Networking, and Placement Acceleration</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/network" className="btn-primary">
            <Share2 size={16} /> Network with Peers <ArrowRight size={16} />
          </Link>
          <Link to="/upload-resume" className="btn-secondary">
            <FileText size={16} /> Upload Resume
          </Link>
        </div>
      </div>

      <div className="services-section" style={{ marginTop: "40px" }}>
        <h2 className="section-title">Why Choose JobConnect?</h2>
        <div className="grid-cards">
          <div className="feature-card">
            <div className="card-icon">
              <Trophy size={24} />
            </div>
            <h3>Guaranteed Placements</h3>
            <p>Connect directly with top recruiters, hyper-growth startups, and MNCs hiring from our network.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <FileText size={24} />
            </div>
            <h3>Resume Visibility</h3>
            <p>Upload your resume and get noticed by engineering leaders with algorithmic skill matching.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <Share2 size={24} />
            </div>
            <h3>Peer Connections</h3>
            <p>Search, discover, and build high-value connections with developers and tech professionals instantly.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <Award size={24} />
            </div>
            <h3>Hackathons & Awards</h3>
            <p>Participate in flagship national hackathons and showcase verified achievements on your profile.</p>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <h2 className="section-title">Upgrade to Pro</h2>
        <p style={{ color: "var(--text-grey)", marginBottom: "48px", textAlign: "center" }}>
          Unlock premium tools, custom job matches, and supercharge your technical trajectory.
        </p>

        <div className="plans-container">
          {/* PRO PLAN */}
          <div className="pricing-card">
            <h2>Pro Plan</h2>
            <div className="price">
              ₹249 <span>/ month</span>
            </div>
            <ul className="pricing-features">
              <li><Check size={16} /> Unlimited Resume Uploads</li>
              <li><Check size={16} /> Advanced Peer Networking</li>
              <li><Check size={16} /> Verified Profile Tag</li>
              <li><Check size={16} /> Unlimited Achievement Posts</li>
              <li><Check size={16} /> Exclusive Hackathon Access</li>
            </ul>
            <button onClick={() => handleSubscribe("pro")} className="btn-secondary" style={{ width: "100%" }}>
              Upgrade Now <Zap size={16} />
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className="pricing-card premium">
            <div className="plan-badge">Most Popular</div>
            <h2>Premium Annual</h2>
            <div className="price">
              ₹1999 <span>/ year</span>
            </div>
            <ul className="pricing-features">
              <li><Check size={16} /> Everything in Pro Plan</li>
              <li><Check size={16} /> Early Feature Access</li>
              <li><Check size={16} /> Automated AI Resume Review</li>
              <li><Check size={16} /> 1-on-1 Career Mentorship</li>
            </ul>
            <button onClick={() => handleSubscribe("premium")} className="btn-primary" style={{ width: "100%" }}>
              Go Premium <Sparkles size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "100px" }}>
        <h2 className="section-title">Success Stories</h2>
        <div className="grid-cards">
          <div className="feature-card" style={{ padding: "28px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)", fontSize: "14px", lineHeight: "1.7" }}>
              "JobConnect Pro was a turning point for my career. The targeted placements and network introduced me directly to founding engineering teams."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>R</div>
              <div>
                <span style={{ color: "var(--accent-white)", fontWeight: "600", fontSize: "14px", display: "block" }}>
                  Rohan J.
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Software Engineer</span>
              </div>
            </div>
          </div>

          <div className="feature-card" style={{ padding: "28px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)", fontSize: "14px", lineHeight: "1.7" }}>
              "Thanks to JobConnect Pro, I uploaded my resume and got matched with senior hiring leaders within days. Clean, efficient, and direct."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>A</div>
              <div>
                <span style={{ color: "var(--accent-white)", fontWeight: "600", fontSize: "14px", display: "block" }}>
                  Aarav S.
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Systems Architect</span>
              </div>
            </div>
          </div>

          <div className="feature-card" style={{ padding: "28px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)", fontSize: "14px", lineHeight: "1.7" }}>
              "JobConnect Pro's hackathon portal is phenomenal! I participated in two national tech challenges and built a portfolio recruiters loved."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>S</div>
              <div>
                <span style={{ color: "var(--accent-white)", fontWeight: "600", fontSize: "14px", display: "block" }}>
                  Shubham J.
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Data Analyst</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
