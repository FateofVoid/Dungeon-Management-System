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

// Normalize the entire nested helper template on every run. Earlier versions
// skipped once they found one escaped marker, leaving later template literals
// (notably cardField()) able to terminate persistenceHelpers prematurely.
let body = source.slice(bodyStart, end)
  .replace(/\\`/g, "`")
  .replace(/\\\$\{/g, "${")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

source = source.slice(0, bodyStart) + body + source.slice(end);
fs.writeFileSync(file, source);
console.log("Normalized nested persistence template literals.");
