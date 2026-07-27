// Tiny zero-dependency JSON file "database".
// Good enough for a small accessibility app and avoids native build
// dependencies (sqlite/postgres drivers) that can fail to install in
// restricted or offline environments.
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function fileFor(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readTable(name) {
  const file = fileFor(name);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, "utf-8").trim();
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Failed to read ${name}.json, resetting to empty array`, e);
    return [];
  }
}

function writeTable(name, rows) {
  fs.writeFileSync(fileFor(name), JSON.stringify(rows, null, 2), "utf-8");
}

module.exports = { readTable, writeTable };
