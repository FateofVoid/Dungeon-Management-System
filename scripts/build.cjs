const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = [
  "src/vendor/toolbox-inner-self.js",
  "src/dms-engine.js"
];
const output = files.map(file => fs.readFileSync(path.join(root, file), "utf8").trimEnd()).join("\n\n");
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist/Library.js"), `${output}\n`, "utf8");
for (const hook of ["Input", "Context", "Output"]) {
  const lower = hook.toLowerCase();
  fs.writeFileSync(
    path.join(root, `dist/${hook}.js`),
    `DungeonManagement("${lower}");\n\nconst modifier = (text) => ({ text${lower === "context" ? ", stop" : ""} });\n\nmodifier(text);\n`,
    "utf8"
  );
}
console.log("Built dist/Library.js and AI Dungeon hook files.");
