import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../App.css";

function HomePage() {
  const navigate = useNavigate();
  const { user, listening, startListening, stopListening, micPermission } = useContext(UserContext);

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const getMicLabel = () => {
    if (micPermission === 'denied') return "Mic access denied";
    if (listening) return "Listening...";
    return "Tap mic to start";
  };

  return (
    <div className="home-container">
      <h1 className="app-title">Welcome, {user ? user.name : 'Guest'}!</h1>
      <p className="app-subtitle">Your accessibility companion</p>
      <div className="mic-section">
        <div 
          className={`mic-button ${listening ? 'listening-effect' : ''}`}
          onClick={handleMicClick}
          aria-label="Microphone control"
        >
          <span role="img" aria-label="mic" style={{ fontSize: "2rem" }}>🎤</span>
        </div>
        <p className="mic-label-text">{getMicLabel()}</p>
      </div>
      <div className="features-grid">
         <div className="feature-card" onClick={() => navigate("/navigation")}><h3>Navigation</h3></div>
        <div className="feature-card" onClick={() => navigate("/detection")}><h3>Obstacle Detection</h3></div>
        <div className="feature-card" onClick={() => navigate("/sos")}><h3>SOS</h3></div>
        <div className="feature-card" onClick={() => navigate("/report")}><h3>Report</h3></div>
      </div>
      <div className="bottom-nav">
        <div className="nav-item active">Home</div>
        <div className="nav-item" onClick={() => navigate('/settings')}>Settings</div>
        <div className="nav-item" onClick={() => navigate('/profile')}>Profile</div>
      </div>
    </div>
  );
}

export default HomePage;