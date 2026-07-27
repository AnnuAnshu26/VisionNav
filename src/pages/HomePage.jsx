import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import BottomNav from "../components/BottomNav";
import "../App.css";

function HomePage() {
  const navigate = useNavigate();
  // The microphone is always-on; VoiceHandler manages listening globally.
  const { user } = useContext(UserContext);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="app-title">Hi {firstName}</h1>
        <p className="app-subtitle">Your accessibility companion</p>
      </div>

      <div className="mic-section">
        <div className="mic-button listening-effect" aria-label="Microphone status">
          <span role="img" aria-label="mic" style={{ fontSize: "2rem" }}>🎤</span>
        </div>
        <span className="status-chip dot-live">
          <span className="dot" aria-hidden="true"></span>
          Microphone is on — say a command anytime
        </span>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => navigate("/navigation")} role="button" tabIndex={0}>
          <span className="feature-icon" aria-hidden="true">🧭</span>
          <h3>Navigation</h3>
          <p>Voice-guided walking directions</p>
        </div>
        <div className="feature-card" onClick={() => navigate("/detection")} role="button" tabIndex={0}>
          <span className="feature-icon" aria-hidden="true">👁</span>
          <h3>Obstacle Detection</h3>
          <p>Camera calls out what's ahead</p>
        </div>
        <div className="feature-card danger" onClick={() => navigate("/sos")} role="button" tabIndex={0}>
          <span className="feature-icon" aria-hidden="true">🆘</span>
          <h3>SOS</h3>
          <p>Alert your emergency contact</p>
        </div>
        <div className="feature-card" onClick={() => navigate("/report")} role="button" tabIndex={0}>
          <span className="feature-icon" aria-hidden="true">⚑</span>
          <h3>Report Hazard</h3>
          <p>Warn others about a hazard</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default HomePage;
