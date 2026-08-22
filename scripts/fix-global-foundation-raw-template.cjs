const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "scripts", "apply-global-foundation.cjs");
let source = fs.readFileSync(file, "utf8");
const start = "const persistenceHelpers = `";
if (source.includes(start)) source = source.replace(start, "const persistenceHelpers = String.raw`");
const end = "\n`;\nreplaceOnce('  function ensureCard";
if (source.includes(end)) source = source.replace(end, "\n`.replace(/\\\\`/g, \"`\").replace(/\\\\\\$\\{/g, \"${\");\nreplaceOnce('  function ensureCard");
fs.writeFileSync(file, source);
console.log("Configured persistence generator as a raw template.");
