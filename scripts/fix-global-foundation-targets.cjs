const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "scripts", "apply-global-foundation.cjs");
let source = fs.readFileSync(file, "utf8");

function removeReplaceBlock(label) {
  const marker = `'${label}'`;
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) return;
  const start = source.lastIndexOf("replaceOnce(", markerAt);
  const end = source.indexOf("\n);", markerAt);
  if (start < 0 || end < 0) throw new Error(`Could not isolate patch block: ${label}`);
  source = source.slice(0, start) + source.slice(end + 3);
}

removeReplaceBlock("active attribute training");
fs.writeFileSync(file, source);
console.log("Normalized patch targets handled by follow-up patcher.");
