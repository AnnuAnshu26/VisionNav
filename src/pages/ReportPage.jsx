// ReportHazardPage.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ReportPage.css";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const severityOptions = ["Low", "Medium", "High", "Critical"];

// Component to pick location on map
function LocationPicker({ setLocation, position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
      map.setView(e.latlng, 13); // Zoom in on click
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

const ReportHazardPage = () => {
  const [location, setLocation] = useState("");
  const [issue, setIssue] = useState("");
  const [severity, setSeverity] = useState("");
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!location || !issue || !severity) {
      setMessage("Please fill all fields");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    console.log("Hazard Reported:", { location, issue, severity });
    setMessage("Hazard reported successfully!");
    setTimeout(() => setMessage(""), 3000);

    // Reset form
    setLocation("");
    setIssue("");
    setSeverity("");
    setPosition(null);
  };

  return (
    <div className="report-container">
      <h1 className="report-title">Report Hazard</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        {/* Location input */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            placeholder="Click on the map to select location"
            readOnly
            aria-label="Hazard location"
          />
        </div>

        {/* Map */}
        <div className="map-container" style={{ height: "250px", width: "100%" }}>
          <MapContainer
            center={[28.6875, 77.0850]} // Hardcoded MAIT location
            zoom={5}
            style={{ height: "250px", width: "100%" }}
          >
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <LocationPicker
              setLocation={setLocation}
              position={position}
              setPosition={setPosition}
            />
          </MapContainer>
        </div>

        {/* Issue */}
        <div className="form-group">
          <label htmlFor="issue">Issue Description</label>
          <textarea
            id="issue"
            value={issue}
            placeholder="Describe the hazard"
            onChange={(e) => setIssue(e.target.value)}
            aria-label="Hazard description"
          />
        </div>

        {/* Severity */}
        <div className="form-group">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Hazard severity"
          >
            <option value="">Select severity</option>
            {severityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="report-btn">
          Report Hazard
        </button>

        {message && <p className="feedback success">{message}</p>}
      </form>
    </div>
  );
};

export default ReportHazardPage;
