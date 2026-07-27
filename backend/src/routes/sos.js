const express = require("express");
const { readTable, writeTable } = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();

// GET /api/sos - list the current user's past SOS alerts
router.get("/", requireAuth, (req, res) => {
  const alerts = readTable("sos")
    .filter((a) => a.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ alerts });
});

// POST /api/sos - log a new SOS alert (triggered when the user hits SOS)
router.post("/", requireAuth, (req, res) => {
  const { lat, lng, emergencyContact } = req.body || {};

  const alerts = readTable("sos");
  const alert = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    userId: req.user.id,
    triggeredBy: req.user.name,
    lat: lat ?? null,
    lng: lng ?? null,
    emergencyContact: emergencyContact || null,
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  writeTable("sos", alerts);

  res.status(201).json({ alert });
});

module.exports = router;
