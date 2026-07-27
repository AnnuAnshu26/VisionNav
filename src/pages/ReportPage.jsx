// ReportPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api/client";
import { speakText } from "../utils/speech";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import "../App.css";
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
function LocationPicker({ setLocation, setCoords, position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.setView(e.latlng, 13);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

const ReportHazardPage = () => {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [issue, setIssue] = useState("");
  const [severity, setSeverity] = useState("");
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      const { reports: list } = await api.listReports();
      setReports(list);
      setLoadError("");
    } catch (e) {
      setLoadError(e.message);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || !issue || !severity) {
      setMessage("Please fill all fields");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      await api.createReport({
        location,
        lat: coords?.lat,
        lng: coords?.lng,
        issue,
        severity,
      });
      setMessage("Hazard reported successfully!");
      setMessageType("success");
      speakText("Hazard reported successfully.");
      setLocation("");
      setIssue("");
      setSeverity("");
      setPosition(null);
      setCoords(null);
      await loadReports();
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="report-container">
      <PageHeader title="Report Hazard" subtitle="Help others avoid what's in the way" />

      <form className="report-form card" onSubmit={handleSubmit}>
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

        <div className="map-container" style={{ height: "250px", width: "100%" }}>
          <MapContainer
            center={[28.6875, 77.085]}
            zoom={5}
            style={{ height: "250px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker
              setLocation={setLocation}
              setCoords={setCoords}
              position={position}
              setPosition={setPosition}
            />
          </MapContainer>
        </div>

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

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Reporting…" : "Report Hazard"}
        </button>

        {message && (
          <p className={messageType === "error" ? "error-message" : "success-message"}>{message}</p>
        )}
      </form>

      <div className="report-list card">
        <h2>Recent Hazard Reports</h2>
        {loadError && <p className="error-message">{loadError}</p>}
        {reports.length === 0 && !loadError && <p>No hazards reported yet.</p>}
        <ul>
          {reports.slice(0, 20).map((r) => (
            <li key={r.id}>
              <strong>[{r.severity}]</strong> {r.issue} — <em>{r.location}</em>
              <br />
              <small>
                Reported by {r.reportedBy} on {new Date(r.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportHazardPage;
