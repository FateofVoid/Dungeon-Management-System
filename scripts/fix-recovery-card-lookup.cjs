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

// Compact names are linkage/progression references only; descriptions remain in
// ordinary Story Cards and are intentionally excluded from save payloads.
source = source.replace(
  'classTier: dms.thronebound.class.tier, skills:',
  'classTier: dms.thronebound.class.tier, className: dms.thronebound.class.name, skills:'
);
source = source.replace(
  'assignedRooms: a.assignedRooms, classTier: a.class?.tier || 0, attrs:',
  'assignedRooms: a.assignedRooms, name: a.name, race: a.race, classTier: a.class?.tier || 0, className: a.class?.name || a.role, attrs:'
);
source = source.replace(
  'if (throneClass) dms.thronebound.class.name = clean(throneClass[1]);',
  'dms.thronebound.class.name = clean(tb.className) || (throneClass ? clean(throneClass[1]) : dms.thronebound.class.name);'
);
source = source.replace(
  'if (adminClass) admin.class.name = clean(adminClass[1]);',
  'admin.class.name = clean(saved.className) || (adminClass ? clean(adminClass[1]) : admin.class.name);'
);
source = source.replace(
  'const line = String(card?.entry || "").split("\\n")[0].split(/\\s+[—-]\\s+/), admin = characterBase(clean(line[0]) || id, clean(line.slice(1).join(" — ")) || dms.population.nature, saved.role || "Manager");',
  'const line = String(card?.entry || "").split("\\n")[0].split(/\\s+[—-]\\s+/), admin = characterBase(clean(saved.name) || clean(line[0]) || id, clean(saved.race) || clean(line.slice(1).join(" — ")) || dms.population.nature, saved.role || "Manager");'
);

// Replace the administrator card lookup by position so formatting changes in the
// generated source cannot leave the old lookup behind.
{
  const adminBlock = source.indexOf('dms.administrators = {}; for (const [id, saved] of Object.entries(progression.admins || {})) {');
  if (adminBlock < 0) throw new Error("Administrator recovery block not found");
  const cardStart = source.indexOf('const card = ', adminBlock);
  const cardEnd = source.indexOf(';', cardStart);
  if (cardStart < 0 || cardEnd < 0) throw new Error("Administrator recovery card lookup not found");
  const replacement = 'const card = managedCardByKey(`DMS_ADMIN_${id.toUpperCase().replace(/\\W/g, "_")}`) || saveCardByTitle(`DMS Administrator — ${saved.name || ""}`)';
  source = source.slice(0, cardStart) + replacement + source.slice(cardEnd);
}

fs.writeFileSync(file, source);
console.log("Normalized managed Story Card linkage and class progression references for recovery.");
