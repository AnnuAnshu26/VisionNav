const express = require("express");
const bcrypt = require("bcryptjs");
const { readTable, writeTable } = require("../db");
const { signToken, requireAuth } = require("../auth");

const router = express.Router();

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, contactNumber, emergencyContact, password } = req.body || {};

  if (!name || !contactNumber || !password) {
    return res
      .status(400)
      .json({ error: "name, contactNumber and password are required." });
  }
  if (!/^\d{10}$/.test(contactNumber)) {
    return res.status(400).json({ error: "contactNumber must be 10 digits." });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters." });
  }

  const users = readTable("users");
  if (users.some((u) => u.contactNumber === contactNumber)) {
    return res.status(409).json({ error: "An account with this number already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    contactNumber,
    emergencyContact: (emergencyContact || "").trim() || "8375004426",
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeTable("users", users);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { contactNumber, password } = req.body || {};
  if (!contactNumber || !password) {
    return res.status(400).json({ error: "contactNumber and password are required." });
  }

  const users = readTable("users");
  const user = users.find((u) => u.contactNumber === contactNumber);
  if (!user) {
    return res.status(401).json({ error: "Invalid contact number or password." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid contact number or password." });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const users = readTable("users");
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

module.exports = router;
