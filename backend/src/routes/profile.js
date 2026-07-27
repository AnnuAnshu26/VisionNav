const express = require("express");
const { readTable, writeTable } = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// PUT /api/profile - update name / contactNumber / emergencyContact
router.put("/", requireAuth, (req, res) => {
  const { name, contactNumber, emergencyContact } = req.body || {};
  const users = readTable("users");
  const idx = users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found." });

  if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
    return res.status(400).json({ error: "contactNumber must be 10 digits." });
  }
  if (
    contactNumber &&
    users.some((u) => u.contactNumber === contactNumber && u.id !== req.user.id)
  ) {
    return res.status(409).json({ error: "Another account already uses this number." });
  }

  users[idx] = {
    ...users[idx],
    name: name?.trim() || users[idx].name,
    contactNumber: contactNumber || users[idx].contactNumber,
    emergencyContact: emergencyContact?.trim() || users[idx].emergencyContact,
  };
  writeTable("users", users);

  res.json({ user: publicUser(users[idx]) });
});

module.exports = router;
