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
          <Briefcase size={22} style={{ color: "var(--accent-gold)" }} /> JobConnect <span>Pro</span>
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/network">
            <Users size={16} /> Network
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload-resume">
            <FileText size={16} /> Resume
          </NavLink>
        </li>
        <li>
          <NavLink to="/achievements">
            <Award size={16} /> Achievements
          </NavLink>
        </li>
        <li>
          <NavLink to="/hackathons">
            <Code2 size={16} /> Hackathons
          </NavLink>
        </li>

        {token && user && (
          <li>
            <NavLink to="/dashboard">
              <User size={16} /> Dashboard
            </NavLink>
          </li>
        )}

        {token && user && user.role === "admin" && (
          <li>
            <NavLink to="/admin" style={{ color: "var(--accent-gold)" }}>
              <ShieldCheck size={16} /> Admin
            </NavLink>
          </li>
        )}
      </ul>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {!token ? (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "14px" }}>
              Register
            </Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-grey)" }}>
              Hi, <strong style={{ color: "var(--text-white)" }}>{user?.fname}</strong>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
