const express = require("express");
const { readTable, writeTable } = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();

// GET /api/reports - list all hazard reports (most recent first)
router.get("/", requireAuth, (req, res) => {
  const reports = readTable("reports").sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ reports });
});

// POST /api/reports - create a hazard report
router.post("/", requireAuth, (req, res) => {
  const { location, lat, lng, issue, severity } = req.body || {};

  if (!location || !issue || !severity) {
    return res.status(400).json({ error: "location, issue and severity are required." });
  }

  const reports = readTable("reports");
  const report = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    location,
    lat: lat ?? null,
    lng: lng ?? null,
    issue,
    severity,
    reportedBy: req.user.name,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  reports.push(report);
  writeTable("reports", reports);

  res.status(201).json({ report });
});

module.exports = router;
