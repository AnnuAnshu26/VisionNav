// components/MapView.js
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PROFILE = "walking";
const PRE_ALERT_DIST = 80;
const FINAL_ALERT_DIST = 20;

const MapView = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [status, setStatus] = useState("Idle");

  const watchIdRef = useRef(null);
  const guidanceRef = useRef({ nextIdx: 0, preAnnouncedIdx: -1 });

  const speak = (text) => {
    console.log("🔊", text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const haversine = (a, b) => {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const formatDistance = (m) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

  const stepText = (step, prefix = "") => {
    const type = step?.maneuver?.type;
    const mod = step?.maneuver?.modifier || "";
    let action = "Continue";
    switch (type) {
      case "depart":
        action = `Head ${mod || "straight"}`;
        break;
      case "turn":
      case "end of road":
        action = `Turn ${mod}`;
        break;
      case "fork":
        action = `Keep ${mod || "straight"}`;
        break;
      case "roundabout":
        action = "Enter the roundabout";
        break;
      case "merge":
        action = "Merge";
        break;
      case "arrive":
        action = "You have arrived at your destination";
        break;
    }
    const street = step?.name ? ` onto ${step.name}` : "";
    return `${prefix}${action}${street}`.trim();
  };

  // --- Initial location ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCurrentLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        console.error("Geolocation error:", err);
        setStatus("Location error");
      },
      { enableHighAccuracy: true }
    );
    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // --- Listen for navigation events from VoiceHandler ---
  useEffect(() => {
    const handleNav = async (e) => {
      const place = e.detail.place;
      if (!place || !currentLocation) return;
      speak(`Searching for ${place}`);
      setStatus(`Searching: ${place}`);
      const dest = await geocode(place);
      if (!dest) {
        setStatus("Destination not found");
        return speak("Sorry, I could not find that location.");
      }
      setDestination(dest);
      await buildRoute(currentLocation, dest);
    };
    window.addEventListener("nav:navigateTo", handleNav);
    return () => window.removeEventListener("nav:navigateTo", handleNav);
  }, [currentLocation]);

  const geocode = async (q) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          q
        )}`
      );
      const data = await res.json();
      return data?.[0]
        ? [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        : null;
    } catch (e) {
      console.error("Geocode error:", e);
      return null;
    }
  };

  const buildRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/${PROFILE}/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json?.routes?.[0]) {
        setStatus("Route not found");
        return speak("No route found.");
      }
      const coords = json.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);
      setRoute(coords);
      speak("Starting navigation.");
      setStatus("Navigating…");
      startGuidance(json.routes[0].legs[0].steps);
    } catch (e) {
      console.error("Route error:", e);
      setStatus("Route error");
      speak("There was a problem fetching the route.");
    }
  };

  const startGuidance = (steps) => {
    if (watchIdRef.current !== null)
      navigator.geolocation.clearWatch(watchIdRef.current);
    guidanceRef.current = { nextIdx: 0, preAnnouncedIdx: -1 };
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const user = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(user);
        const idx = guidanceRef.current.nextIdx;
        if (!steps[idx]) return;
        const next = steps[idx];
        const stepLoc = [next.maneuver.location[1], next.maneuver.location[0]];
        const dist = haversine(user, stepLoc);

        if (
          idx !== guidanceRef.current.preAnnouncedIdx &&
          dist < PRE_ALERT_DIST &&
          dist > FINAL_ALERT_DIST
        ) {
          speak(
            stepText(next, `In ${formatDistance(Math.max(dist, FINAL_ALERT_DIST))}, `)
          );
          guidanceRef.current.preAnnouncedIdx = idx;
        }

        if (dist <= FINAL_ALERT_DIST) {
          speak(stepText(next));
          guidanceRef.current.nextIdx = idx + 1;
          if (
            next.maneuver?.type === "arrive" ||
            guidanceRef.current.nextIdx >= steps.length
          ) {
            speak("Navigation finished.");
            setStatus("Arrived");
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        }
      },
      (err) => console.error("watchPosition error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  if (!currentLocation)
    return <div className="p-4">📍 Getting your location…</div>;

  return (
    <div
      className="relative h-full w-full"
      style={{ height: "100vh", width: "100%" }}
    >
      <MapContainer
        center={currentLocation}
        zoom={15}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}
        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: "blue" }} />
        )}
      </MapContainer>
      <div className="absolute bottom-5 right-5 bg-white px-4 py-2 rounded shadow text-sm">
        {status}
      </div>
    </div>
  );
};

export default MapView;
