const { execFileSync } = require("node:child_process");
const path = require("node:path");
execFileSync(process.execPath, [path.join(process.cwd(), "scripts", "complete-global-foundation.cjs")], { stdio: "inherit" });
