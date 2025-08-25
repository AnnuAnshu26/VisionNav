// src/pages/DetectionPage.jsx
import React from "react";
import VoiceHandler from "../components/VoiceHandler";

function DetectionPage() {
  return (
    <div className="container">
      <VoiceHandler />
      <h2>Object Detection Screen</h2>
      <p>(Dummy content - Actual TensorFlow.js model will come later)</p>
    </div>
  );
}

export default DetectionPage;
