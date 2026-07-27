# NavAssist (VisionNav)

A full-stack accessibility companion app for visually-impaired users: real-time obstacle
detection, voice-guided navigation, hazard reporting, and an SOS button — with a working
backend for accounts, hazard reports, and SOS logs.

## Why nothing here needs a paid AI key or hits a daily limit

- **Object detection** runs 100% in the browser using **TensorFlow.js + COCO-SSD**. The
  model downloads once (cached by the browser) and then does every prediction on-device.
  No API key, no per-request cost, no rate limit.
- **Voice commands & speech feedback** use the browser's built-in **Web Speech API**
  (`SpeechRecognition` / `speechSynthesis`) — free, built into Chrome/Edge, no external calls.
- **Maps, geocoding and routing** use the free public **OpenStreetMap Nominatim** and
  **OSRM** APIs. These are shared public demo servers — fine for personal/dev use and
  testing, but if you ever get heavy real-world traffic you should self-host Nominatim/OSRM
  or switch to a paid provider (Mapbox, Google) for reliability.
- **Accounts, hazard reports and SOS history** are handled by a small **Node/Express
  backend included in this repo** (`/backend`) — nothing calls out to a third-party AI
  service, so there's no external quota to hit at all.

## Project structure

```
VisionNav/
├── backend/            # Express API: auth, profile, hazard reports, SOS logging
│   ├── src/
│   │   ├── server.js
│   │   ├── auth.js
│   │   ├── db.js
│   │   └── routes/
│   ├── data/           # JSON "database" files, created automatically at runtime
│   └── .env.example
├── src/                # React frontend
│   ├── api/client.js   # fetch wrapper that talks to the backend
│   ├── components/     # ObjectDetection, MapView, VoiceHandler
│   ├── context/         # UserContext (auth state)
│   └── pages/           # Login, Home, Navigation, Detection, Report, SOS, Settings, Profile
└── .env.example
```

## Requirements

- Node.js 18+ and npm
- A webcam (for obstacle detection) and a browser that supports `getUserMedia`,
  `SpeechRecognition`, and `speechSynthesis` — **Chrome or Edge is recommended**;
  Firefox/Safari don't fully support the Web Speech recognition API.
- HTTPS or `localhost` for camera/microphone/geolocation permissions to work (browsers
  block these on plain `http://` non-localhost origins).

## 1. Run the backend

```bash
cd backend
cp .env.example .env      # optionally edit JWT_SECRET
npm install
npm start
```

You should see:
```
NavAssist backend running on http://localhost:5000
```

Data is stored as plain JSON files in `backend/data/` (`users.json`, `reports.json`,
`sos.json`) — no database server to install. Delete those files any time to reset the app.

Quick health check: `curl http://localhost:5000/api/health`

## 2. Run the frontend

In a second terminal, from the project root:

```bash
cp .env.example .env       # points the app at http://localhost:5000/api by default
npm install
npm start
```

This opens `http://localhost:3000`. On first load you'll land on the **Create Account**
tab — register with a name, a 10-digit phone number, an optional emergency contact
number, and a password. That calls the real backend, hashes your password, and returns a
JWT that's stored in `localStorage` for future logins.

## Using the app

- **Home** — quick links to Navigation, Detection, SOS, Report.
- **Navigation** — say "navigate <place>" (mic is always listening once logged in) or use
  the map; it geocodes the place, draws a walking route, and gives turn-by-turn spoken
  directions as you move.
- **Detection** — turns on your camera and speaks out loud what it sees ("Detected
  person", "Detected chair", etc.), throttled so it doesn't repeat constantly.
- **Report** — tap a spot on the map, describe the hazard and severity, and submit; it's
  saved on the backend and shown to every user in the "Recent Hazard Reports" list.
- **SOS** — grabs your GPS location, logs the alert on the backend, and opens your
  device's SMS app with a pre-filled message to your emergency contact (you still have to
  press Send — browsers can't send SMS on their own).
- **Settings** — update your name/contact/emergency number (persisted via the backend) or
  log out.
- Say **"go back"**, **"home"**, **"profile"**, **"settings"**, **"report"**, or
  **"sos"/"help"** at any time — the global voice handler listens continuously.

## Backend API reference

| Method | Path              | Auth | Body                                              | Description               |
|--------|-------------------|------|----------------------------------------------------|----------------------------|
| POST   | /api/auth/register| No   | name, contactNumber, emergencyContact, password    | Create an account          |
| POST   | /api/auth/login   | No   | contactNumber, password                            | Log in, get a JWT          |
| GET    | /api/auth/me      | Yes  | —                                                   | Get the current user       |
| PUT    | /api/profile      | Yes  | name?, contactNumber?, emergencyContact?           | Update profile             |
| GET    | /api/reports      | Yes  | —                                                   | List all hazard reports    |
| POST   | /api/reports      | Yes  | location, lat?, lng?, issue, severity              | Create a hazard report     |
| GET    | /api/sos          | Yes  | —                                                   | List your own SOS alerts   |
| POST   | /api/sos          | Yes  | lat?, lng?, emergencyContact?                       | Log a new SOS alert        |

Authenticated routes expect `Authorization: Bearer <token>`.

## Deploying for real use

- Swap the JSON file store for Postgres/MongoDB if you expect concurrent writers at scale
  (the JSON store uses last-write-wins, fine for a demo or small user base).
- Set a strong, random `JWT_SECRET` in `backend/.env` in production.
- Serve the frontend over HTTPS (required by most browsers for camera/mic/location) and
  point `REACT_APP_API_URL` at your deployed backend URL.
- If you outgrow the public Nominatim/OSRM servers' fair-use limits, self-host them or
  switch to a commercial routing/geocoding provider.

## Troubleshooting

- **"Could not reach the NavAssist server"** — the backend isn't running, or
  `REACT_APP_API_URL` in your frontend `.env` doesn't match where it's running.
- **Mic/camera/location permission prompts don't appear** — make sure you're on
  `http://localhost:3000` (not a raw IP) or HTTPS.
- **Voice recognition does nothing** — use Chrome or Edge; Firefox and Safari don't
  support the SpeechRecognition API used here.
