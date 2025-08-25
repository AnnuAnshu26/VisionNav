import React from "react";
import MapView from "../components/MapView";
import ObjectDetection from "../components/ObjectDetection";

const NavigationPage = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#111",
      }}
    >
      <div style={{ borderRight: "2px solid #333", padding: "8px", minWidth: 0, minHeight: 0 }}>
        <div style={{ color: "#00ff88", fontWeight: 700, marginBottom: 8 }}>Object Detection</div>
        <div style={{ height: "calc(100% - 28px)", background: "#000", borderRadius: 8, overflow: "hidden" }}>
          <ObjectDetection />
        </div>
      </div>

      <div style={{ padding: "8px", minWidth: 0, minHeight: 0 }}>
        <div style={{ color: "#00ff88", fontWeight: 700, marginBottom: 8 }}>Navigation Map</div>
        <div style={{ height: "calc(100% - 28px)", background: "#000", borderRadius: 8, overflow: "hidden" }}>
          {/* Disable MapView's internal SR because we have a single global assistant */}
          <MapView enableVoice={false} />
        </div>
      </div>
    </div>
  );
};

export default NavigationPage;