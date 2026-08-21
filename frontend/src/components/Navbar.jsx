import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Briefcase, User, ShieldCheck, LogOut, Award, Code2, Users, FileText } from "lucide-react";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <div className="logo-dot" />
          <span>JobConnect</span>
          <span style={{ fontSize: "12px", background: "rgba(255, 255, 255, 0.1)", padding: "2px 8px", borderRadius: "100px", border: "1px solid var(--border-card)", color: "var(--accent-white)" }}>PRO</span>
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/network">
            <Users size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Network
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload-resume">
            <FileText size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Resume
          </NavLink>
        </li>
        <li>
          <NavLink to="/achievements">
            <Award size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Achievements
          </NavLink>
        </li>
        <li>
          <NavLink to="/hackathons">
            <Code2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Hackathons
          </NavLink>
        </li>

        {token && user && (
          <li>
            <NavLink to="/dashboard">
              <User size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Dashboard
            </NavLink>
          </li>
        )}

        {token && user && user.role === "admin" && (
          <li>
            <NavLink to="/admin" style={{ color: "var(--accent-white)", fontWeight: "700" }}>
              <ShieldCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Admin
            </NavLink>
          </li>
        )}
      </ul>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {!token ? (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: "8px 18px", fontSize: "13px" }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
              Register
            </Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-grey)" }}>
              Hi, <strong style={{ color: "var(--text-primary)" }}>{user?.fname}</strong>
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
