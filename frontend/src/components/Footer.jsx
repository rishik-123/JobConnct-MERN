import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-card)",
        padding: "30px 24px",
        textAlign: "center",
        color: "var(--text-grey)",
        fontSize: "14px",
        marginTop: "60px",
        backgroundColor: "rgba(10,10,12,0.6)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", maxWidth: "1200px", margin: "0 auto", alignItems: "center" }}>
        <p>&copy; {new Date().getFullYear()} JobConnect Pro. Grow faster. Learn better. Achieve more.</p>
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="#" style={{ color: "var(--text-grey)", textDecoration: "none" }}>Terms of Service</a>
          <a href="#" style={{ color: "var(--text-grey)", textDecoration: "none" }}>Privacy Policy</a>
          <a href="#" style={{ color: "var(--text-grey)", textDecoration: "none" }}>Support Helpdesk</a>
        </div>
      </div>
    </footer>
  );
}
