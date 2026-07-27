import React from "react";
import MapView from "../components/MapView";
import PageHeader from "../components/PageHeader";
import "../App.css";
import "./FullScreenTool.css";

const NavigationPage = () => {
  return (
    <div className="tool-page">
      <PageHeader title="Navigation" subtitle="Say “navigate to…” or tap the map" />
      <div className="tool-viewport">
        {/* Global VoiceHandler already listens for commands, so disable MapView's own recognizer. */}
        <MapView enableVoice={false} />
      </div>
    </div>
  );
};

export default NavigationPage;
