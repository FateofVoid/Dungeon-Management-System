const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "scripts", "apply-global-foundation.cjs");
let source = fs.readFileSync(file, "utf8");
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

// Normalize every remaining nested helper template on every run. The cardField
// regex above deliberately avoids a nested template because its `$` anchor next
// to an escaped backtick is fragile when the generator is converted to String.raw.
body = body
  .replace(/\\`/g, "`")
  .replace(/\\\$\{/g, "${")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

source = source.slice(0, bodyStart) + body + source.slice(end);
fs.writeFileSync(file, source);
console.log("Normalized nested persistence template literals and cardField regex.");
