import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { speakText } from "../context/UserContext"; // Import speakText utility

const MapView = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const watchIdRef = useRef(null);

  // ... (haversine, formatDistance, stepText functions remain the same)
  const haversine = (a, b) => {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  
  // Geocode function to convert place name to coordinates
  const geocode = async (q) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      return data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
    } catch (e) { return null; }
  };

  const buildRoute = useCallback(async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/walking/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json?.routes?.[0]) return speakText("No route found.");
      const coords = json.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      setRoute(coords);
      speakText("Starting guidance.");
      // startGuidance(json.routes[0].legs[0].steps); // You can add the turn-by-turn guidance logic here
    } catch (e) {
      speakText("There was a problem fetching the route.");
    }
  }, []);

  // Effect to get the initial location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // --- NEW: This useEffect listens for the global voice command ---
  useEffect(() => {
    const handleNavCommand = async (event) => {
      const place = event.detail?.place;
      if (!place || !currentLocation) return;
      
      const dest = await geocode(place);
      if (!dest) return speakText(`Sorry, I could not find ${place}.`);
      
      setDestination(dest);
      await buildRoute(currentLocation, dest);
    };

    window.addEventListener('nav:navigateTo', handleNavCommand);
    return () => window.removeEventListener('nav:navigateTo', handleNavCommand);
  }, [currentLocation, buildRoute]);

  if (!currentLocation) {
    return (
      <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
        Getting your location…
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={currentLocation} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={currentLocation}><Popup>You are here</Popup></Marker>
        {destination && <Marker position={destination}><Popup>Destination</Popup></Marker>}
        {route.length > 0 && <Polyline positions={route} pathOptions={{ color: "blue" }} />}
      </MapContainer>
    </div>
  );
};

export default MapView;