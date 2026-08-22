const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const file = path.join(process.cwd(), "Library.js");
let source = fs.readFileSync(file, "utf8");

if (source.includes("  const SCHEMA = 4;")) {
  execFileSync(process.execPath, [path.join(process.cwd(), "scripts", "complete-global-foundation.cjs")], { stdio: "inherit" });
  process.exit(0);
}

const before = 'const hall = Object.values(dms.rooms).find(room => room.definition === "attribute-training-hall"); if (!hall) throw new Error("Attribute Training Hall is required."); energy = clamp(Math.floor(energy), 1, 10000); spend(dms, { energy });';
const after = 'const hall = Object.values(dms.rooms).find(room => room.definition === "attribute-training-hall" && room.state === "Active"); if (!hall) throw new Error("An active Attribute Training Hall is required."); energy = clamp(Math.floor(energy), 1, 10000); spend(dms, { energy }, "attribute-training");';
if (!source.includes(before)) throw new Error("Active attribute training source target not found.");
source = source.replace(before, after);
fs.writeFileSync(file, source);
console.log("Applied follow-up active-room foundation patches.");
