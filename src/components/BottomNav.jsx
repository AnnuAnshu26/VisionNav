import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/report", label: "Report", icon: "⚑" },
  { path: "/profile", label: "Profile", icon: "◔" },
  { path: "/settings", label: "Settings", icon: "⚙" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.path}
          type="button"
          className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
