const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "Library.js");
let source = fs.readFileSync(file, "utf8");

function replaceBetween(startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Completion start target not found: ${label}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Completion end target not found: ${label}`);
  source = source.slice(0, start) + replacement + source.slice(end);
}

replaceBetween(
  '  function identityReady(dms) {',
  '  function defineResource(dms, role, specification) {',
  `  function identityReady(dms) {
    const defined = value => clean(value) && !/^(?:Undefined|Unnamed|Unformed)(?:\\b|$)/i.test(clean(value));
    return defined(dms.thronebound.name) && defined(dms.thronebound.race) && defined(dms.dungeon.name) && defined(dms.dungeon.theme) && defined(dms.dungeon.style) && defined(dms.population.workerDescription) && defined(dms.population.soldierDescription) && defined(dms.world.homeworld) && RESOURCE_ROLES.every(role => resourceReady(dms.dungeon.resources[role]));
  }
`,
  "strict identity readiness"
);

{
  const fn = source.indexOf('  function applyActivityTurn(dms, inputText, actionCount = 0) {');
  if (fn < 0) throw new Error("Activity function not found");
  const lineStart = source.indexOf('    const key = ', fn);
  if (lineStart < 0) throw new Error("Activity retry line not found");
  const lineEnd = source.indexOf('\n', lineStart);
  if (lineEnd < 0) throw new Error("Activity retry line end not found");
  const replacement = '    const locationKey = [dms.activity.location.major, dms.activity.location.secondary, dms.activity.location.detail].map(clean).join("|"); const key = `${actionCount}|${clean(inputText)}|${dms.activity.mode}|${dms.activity.pace}|${locationKey}|${dms.activity.targets.map(clean).join(",")}`; if (dms.activity.lastTurnKey === key) return { repeated: true, reports: [] }; dms.activity.lastTurnKey = key;';
  source = source.slice(0, lineStart) + replacement + source.slice(lineEnd);
}

{
  const fn = source.indexOf('  function readSaveCards() {');
  if (fn < 0) throw new Error("readSaveCards not found");
  const start = source.indexOf('    if (!values.core) return null;', fn);
  const end = source.indexOf('    return { revision: rev, ...values };', start);
  if (start < 0 || end < 0) throw new Error("Save bundle validation block not found");
  const replacement = '    if (Object.values(values).some(value => !value)) return null;\n    const rev = Number(values.core.rev);\n    for (const value of Object.values(values)) if (Number(value.rev) !== rev) return null;\n';
  source = source.slice(0, start) + replacement + source.slice(end);
}

replaceBetween(
  '  function createQuest(dms, category, titleText, objective, rewards = {}) {',
  '  function trainAttribute(dms, attributeName, energy = 10) {',
  `  function questPrerequisitesMet(dms, quest) { return (quest.prerequisites || []).every(id => dms.quests.records[id]?.status === "cleared"); }
  function createQuest(dms, category, titleText, objective, rewards = {}, prerequisites = []) {
    category = QUEST_CATEGORIES.find(value => value.toLowerCase() === clean(category).toLowerCase()); if (!category) throw new Error(\`Quest category must be \${QUEST_CATEGORIES.join(", ")}.\`);
    const required = unique((Array.isArray(prerequisites) ? prerequisites : [prerequisites]).map(clean).filter(Boolean));
    for (const id of required) if (!dms.quests.records[id]) throw new Error(\`Unknown Quest prerequisite: \${id}.\`);
    const seed = \`\${category}|\${clean(titleText)}|\${clean(objective)}|\${required.join(",")}\`, id = \`\${category.toLowerCase()}-\${stableNumber(seed).toString(36)}\`;
    if (dms.quests.records[id]) return dms.quests.records[id];
    const quest = { id, category, title: clean(titleText), objective: clean(objective), tier: dms.dungeon.tier, status: required.every(requiredId => dms.quests.records[requiredId]?.status === "cleared") ? "active" : "locked", prerequisites: required, rewards: { experience: 50 * Math.max(1, dms.dungeon.tier), energy: 10 * Math.max(1, dms.dungeon.tier), ...rewards } }; dms.quests.records[id] = quest; record(dms, \`Created \${category} Quest: \${clean(titleText)}.\`); return quest;
  }
  function completeQuest(dms, questId) { const quest = dms.quests.records[clean(questId)]; if (!quest) throw new Error("Unknown Quest."); if (!questPrerequisitesMet(dms, quest)) throw new Error("Quest prerequisites are not cleared."); if (quest.status === "locked") quest.status = "active"; if (quest.status !== "active") throw new Error("Unknown or inactive Quest."); quest.status = "cleared"; const levels = awardQuest(dms, quest); for (const candidate of Object.values(dms.quests.records)) if (candidate.status === "locked" && questPrerequisitesMet(dms, candidate)) candidate.status = "active"; record(dms, \`Completed \${quest.category || "Dungeon"} Quest: \${quest.title}.\`); return { quest, levels }; }
`,
  "quest prerequisites"
);

source = source.replace(
  'trainAttribute, createQuest, completeQuest, awardQuest,',
  'trainAttribute, createQuest, completeQuest, questPrerequisitesMet, awardQuest,'
);

fs.writeFileSync(file, source);
console.log("Completed DMS foundation safeguards.");
