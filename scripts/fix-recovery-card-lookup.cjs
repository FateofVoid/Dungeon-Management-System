const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "Library.js");
let source = fs.readFileSync(file, "utf8");

if (!source.includes("function managedCardByKey(key)")) {
  const marker = "  function loadSaveCards(candidate, snapshot = readSaveCards()) {";
  const at = source.indexOf(marker);
  if (at < 0) throw new Error("loadSaveCards insertion point not found");
  const helper = `  function managedCardByKey(key) {
    const target = clean(key).toUpperCase();
    return Array.isArray(global.storyCards) ? global.storyCards.find(item => String(item.keys || "").split(",").map(value => clean(value).toUpperCase()).includes(target)) : null;
  }
`;
  source = source.slice(0, at) + helper + source.slice(at);
}

source = source.replace(
  /const card = Array\.isArray\(global\.storyCards\) \? global\.storyCards\.find\(item => clean\(item\.keys\)\.split\(","\)\.includes\(`DMS_QUEST_\$\{id\.toUpperCase\(\)\.replace\(\/\\W\/g, "_"\)\}`\)\) : null;/g,
  'const card = managedCardByKey(`DMS_QUEST_${id.toUpperCase().replace(/\\W/g, "_")}`);'
);
source = source.replace(
  /const card = Array\.isArray\(global\.storyCards\) \? global\.storyCards\.find\(item => clean\(item\.keys\)\.split\(","\)\.includes\(`DMS_ADMIN_\$\{id\.toUpperCase\(\)\.replace\(\/\\W\/g, "_"\)\}`\)\) : null;/g,
  'const card = managedCardByKey(`DMS_ADMIN_${id.toUpperCase().replace(/\\W/g, "_")}`);'
);

fs.writeFileSync(file, source);
console.log("Normalized managed Story Card lookup for recovery.");
