import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, BACKEND_URL } from "../context/AuthContext";
import { Trophy, FileText, Share2, Award, Check } from "lucide-react";

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
        <h1>Welcome to JobBoard Pro</h1>
        <p>Your Ultimate Guide to All Job-Related Opportunities, Networking, and Placement Solutions</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link to="/network" className="btn-primary">
            <Share2 size={18} /> Network with Peers
          </Link>
          <Link to="/upload-resume" className="btn-secondary">
            <FileText size={18} /> Upload Resume
          </Link>
        </div>
      </div>

      <div className="services-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="grid-cards">
          <div className="feature-card">
            <div className="card-icon">
              <Trophy size={26} />
            </div>
            <h3>Guaranteed Placements</h3>
            <p>Connect directly with top recruiters and MNCs hiring from our network.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <FileText size={26} />
            </div>
            <h3>Resume Visibility</h3>
            <p>Upload your resume and get noticed by hiring managers with customized matching.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <Share2 size={26} />
            </div>
            <h3>Peer Connections</h3>
            <p>Search, find, and connect with other students and tech professionals instantly.</p>
          </div>

          <div className="feature-card">
            <div className="card-icon">
              <Award size={26} />
            </div>
            <h3>Hackathons & Awards</h3>
            <p>Apply to national hackathons and showcase certificates directly on your profile.</p>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <h2 className="section-title">Upgrade to Pro Version</h2>
        <p style={{ color: "var(--text-grey)", marginBottom: "40px" }}>
          Unlock premium tools, custom matches, and take your career growth to the next level.
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
              <li><Check size={16} /> Premium Networking Tools</li>
              <li><Check size={16} /> Highlighted Profile Tag</li>
              <li><Check size={16} /> Unlimited Achievements Posts</li>
              <li><Check size={16} /> Exclusive Hackathon Access</li>
            </ul>
            <button onClick={() => handleSubscribe("pro")} className="btn-primary" style={{ width: "100%" }}>
              Upgrade Now ⭐
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
              <li><Check size={16} /> AI Resume Review</li>
              <li><Check size={16} /> Career Mentorship Sessions</li>
            </ul>
            <button onClick={() => handleSubscribe("premium")} className="btn-primary" style={{ width: "100%" }}>
              Go Premium ✨
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "80px" }}>
        <h2 className="section-title">Success Reviews</h2>
        <div className="grid-cards">
          <div className="feature-card" style={{ padding: "24px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)" }}>
              "JobBoard Pro has been a game-changer for my career. The guaranteed placements and internships helped me land my dream job!"
            </p>
            <span style={{ color: "var(--accent-gold)", fontWeight: "600", fontSize: "14px", marginTop: "12px" }}>
              - Rohan J., Software Dev
            </span>
          </div>

          <div className="feature-card" style={{ padding: "24px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)" }}>
              "Thanks to JobBoard Pro, I was able to upload my resume and get noticed by top recruiters. The platform is user-friendly and effective."
            </p>
            <span style={{ color: "var(--accent-gold)", fontWeight: "600", fontSize: "14px", marginTop: "12px" }}>
              - Devam P., Systems Engineer
            </span>
          </div>

          <div className="feature-card" style={{ padding: "24px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-grey)" }}>
              "JobBoard Pro's hackathon section is fantastic! I participated in several events and won prizes that boosted my portfolio."
            </p>
            <span style={{ color: "var(--accent-gold)", fontWeight: "600", fontSize: "14px", marginTop: "12px" }}>
              - Shubham J., Data Analyst
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
