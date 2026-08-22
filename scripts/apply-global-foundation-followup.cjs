const { execFileSync, execSync } = require("node:child_process");
const path = require("node:path");
const run = name => execFileSync(process.execPath, [path.join(process.cwd(), "scripts", name)], { stdio: "inherit" });
run("complete-global-foundation.cjs");
run("fix-recovery-card-lookup.cjs");

// Materialize the already-verified large Library.js delta because the connector
// cannot patch the 634 KB file incrementally. Do not commit unless the generated
// runtime passes syntax, regressions, and whitespace validation first.
execFileSync(process.execPath, ["--check", "Library.js"], { stdio: "inherit" });
execSync("npm test", { stdio: "inherit" });
execSync("git diff --check", { stdio: "inherit" });
if (execSync("git status --porcelain -- Library.js", { encoding: "utf8" }).trim()) {
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync("git add Library.js");
  execSync('git commit -m "fix: complete DMS persistence recovery"', { stdio: "inherit" });
  execSync("git push origin HEAD:feature/global-foundation-persistence", { stdio: "inherit" });
}
