import React from "react";
import ObjectDetection from "../components/ObjectDetection";
import PageHeader from "../components/PageHeader";
import "../App.css";
import "./FullScreenTool.css";

const DetectionPage = () => {
  return (
    <div className="tool-page">
      <PageHeader title="Obstacle Detection" subtitle="Point your camera ahead — I'll call out what I see" />
      <div className="tool-viewport">
        <ObjectDetection />
      </div>
    </div>
  );
};

export default DetectionPage;
