const fs = require("node:fs");
const path = require("node:path");

const libraryFile = path.join(process.cwd(), "Library.js");
const patcherFile = path.join(process.cwd(), "scripts", "apply-global-foundation.cjs");
const library = fs.readFileSync(libraryFile, "utf8");

if (library.includes("  const SCHEMA = 4;")) {
  fs.writeFileSync(patcherFile, 'console.log("Base DMS foundation is already materialized.");\n');
  console.log("Base foundation already present; skipped legacy generator repair.");
  process.exit(0);
}

let source = fs.readFileSync(patcherFile, "utf8");
const marker = "const persistenceHelpers = `";
const start = source.indexOf(marker);
if (start < 0) throw new Error("persistenceHelpers template not found");
const bodyStart = start + marker.length;
const endMarker = "\n`;\nreplaceOnce('  function ensureCard";
const end = source.indexOf(endMarker, bodyStart);
if (end < 0) throw new Error("persistenceHelpers template end not found");
let body = source.slice(bodyStart, end);
body = body.replace(
  'function cardField(card, label) { return clean(String(card?.entry || "").match(new RegExp(`^${label}:\\\\s*(.+)$`, "im"))?.[1]); }',
  'function cardField(card, label) { return clean(String(card?.entry || "").match(new RegExp("^" + label + ":\\\\s*(.+)$", "im"))?.[1]); }'
);
body = body.replace(/\\`/g, "`").replace(/\\\$\{/g, "${").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
source = source.slice(0, bodyStart) + body + source.slice(end);
fs.writeFileSync(patcherFile, source);
console.log("Normalized nested persistence template literals and cardField regex.");
