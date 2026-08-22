const { execFileSync } = require("node:child_process");
const path = require("node:path");
const run = name => execFileSync(process.execPath, [path.join(process.cwd(), "scripts", name)], { stdio: "inherit" });
run("complete-global-foundation.cjs");
run("fix-recovery-card-lookup.cjs");
