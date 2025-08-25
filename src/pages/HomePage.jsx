import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../App.css";

function HomePage() {
  const navigate = useNavigate();
  // We only need the user's name for the welcome message.
  // The microphone is now handled automatically by VoiceController.
  const { user } = useContext(UserContext);

  return (
    <div className="home-container">
      <h1 className="app-title">Welcome, {user ? user.name : 'Guest'}!</h1>
      <p className="app-subtitle">Your accessibility companion</p>

      {/* Mic Section is now a STATUS INDICATOR, not a button */}
      <div className="mic-section">
        <div
          className="mic-button listening-effect" // Always has the listening effect
          aria-label="Microphone status"
        >
          <span role="img" aria-label="mic" style={{ fontSize: "2rem" }}>🎤</span>
        </div>
        {/* The label now correctly shows the automatic status */}
        <p className="mic-label-text">Microphone is ON</p>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => navigate("/navigation")}>
          <h3>Navigation</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/detection")}>
          <h3>Obstacle Detection</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/sos")}>
          <h3>SOS</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/report")}>
          <h3>Report</h3>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="nav-item active" onClick={() => navigate('/')}>Home</div>
        <div className="nav-item" onClick={() => navigate('/settings')}>Settings</div>
        <div className="nav-item" onClick={() => navigate('/profile')}>Profile</div>
        <div className="nav-item" onClick={() => navigate('/report')}>Report</div>

      </div>
    </div>
  );
}

export default HomePage;