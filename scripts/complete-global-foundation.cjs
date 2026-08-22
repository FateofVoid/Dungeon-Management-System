const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "Library.js");
let source = fs.readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`Completion target not found: ${label}`);
  source = source.replace(before, after);
}

replaceOnce(
  '  function identityReady(dms) {\n    return dms.dungeon.theme !== "Unformed" && dms.dungeon.style !== "Undefined" && dms.population.workerDescription !== "Undefined dungeon workers" && dms.population.soldierDescription !== "Undefined dungeon soldiers" && RESOURCE_ROLES.every(role => resourceReady(dms.dungeon.resources[role]));\n  }',
  '  function identityReady(dms) {\n    const defined = value => clean(value) && !/^(?:Undefined|Unnamed|Unformed)(?:\\b|$)/i.test(clean(value));\n    return defined(dms.thronebound.name) && defined(dms.thronebound.race) && defined(dms.dungeon.name) && defined(dms.dungeon.theme) && defined(dms.dungeon.style) && defined(dms.population.workerDescription) && defined(dms.population.soldierDescription) && defined(dms.world.homeworld) && RESOURCE_ROLES.every(role => resourceReady(dms.dungeon.resources[role]));\n  }',
  "strict identity readiness"
);

replaceOnce(
  '    const key = `${actionCount}|${clean(inputText)}|${dms.activity.mode}`; if (dms.activity.lastTurnKey === key) return { repeated: true, reports: [] }; dms.activity.lastTurnKey = key;',
  '    const locationKey = [dms.activity.location.major, dms.activity.location.secondary, dms.activity.location.detail].map(clean).join("|"); const key = `${actionCount}|${clean(inputText)}|${dms.activity.mode}|${dms.activity.pace}|${locationKey}|${dms.activity.targets.map(clean).join(",")}`; if (dms.activity.lastTurnKey === key) return { repeated: true, reports: [] }; dms.activity.lastTurnKey = key;',
  "activity retry identity"
);

replaceOnce(
  '    if (!values.core) return null;\n    const rev = Number(values.core.rev);\n    for (const value of Object.values(values)) if (value && Number(value.rev) !== rev) return null;',
  '    if (Object.values(values).some(value => !value)) return null;\n    const rev = Number(values.core.rev);\n    for (const value of Object.values(values)) if (Number(value.rev) !== rev) return null;',
  "complete save bundle validation"
);

replaceOnce(
  '  function createQuest(dms, category, titleText, objective, rewards = {}) {\n    category = QUEST_CATEGORIES.find(value => value.toLowerCase() === clean(category).toLowerCase()); if (!category) throw new Error(`Quest category must be ${QUEST_CATEGORIES.join(", ")}.`);\n    const seed = `${category}|${clean(titleText)}|${clean(objective)}`, id = `${category.toLowerCase()}-${stableNumber(seed).toString(36)}`;\n    if (dms.quests.records[id]) return dms.quests.records[id];\n    dms.quests.records[id] = { category, title: clean(titleText), objective: clean(objective), tier: dms.dungeon.tier, status: "active", prerequisites: [], rewards: { experience: 50 * Math.max(1, dms.dungeon.tier), energy: 10 * Math.max(1, dms.dungeon.tier), ...rewards } }; record(dms, `Created ${category} Quest: ${clean(titleText)}.`); return dms.quests.records[id];\n  }\n  function completeQuest(dms, questId) { const quest = dms.quests.records[clean(questId)]; if (!quest || quest.status !== "active") throw new Error("Unknown or inactive Quest."); quest.status = "cleared"; const levels = awardQuest(dms, quest); record(dms, `Completed ${quest.category || "Dungeon"} Quest: ${quest.title}.`); return { quest, levels }; }',
  '  function questPrerequisitesMet(dms, quest) { return (quest.prerequisites || []).every(id => dms.quests.records[id]?.status === "cleared"); }\n  function createQuest(dms, category, titleText, objective, rewards = {}, prerequisites = []) {\n    category = QUEST_CATEGORIES.find(value => value.toLowerCase() === clean(category).toLowerCase()); if (!category) throw new Error(`Quest category must be ${QUEST_CATEGORIES.join(", ")}.`);\n    const required = unique((Array.isArray(prerequisites) ? prerequisites : [prerequisites]).map(clean).filter(Boolean));\n    for (const id of required) if (!dms.quests.records[id]) throw new Error(`Unknown Quest prerequisite: ${id}.`);\n    const seed = `${category}|${clean(titleText)}|${clean(objective)}|${required.join(",")}`, id = `${category.toLowerCase()}-${stableNumber(seed).toString(36)}`;\n    if (dms.quests.records[id]) return dms.quests.records[id];\n    const quest = { category, title: clean(titleText), objective: clean(objective), tier: dms.dungeon.tier, status: required.every(requiredId => dms.quests.records[requiredId]?.status === "cleared") ? "active" : "locked", prerequisites: required, rewards: { experience: 50 * Math.max(1, dms.dungeon.tier), energy: 10 * Math.max(1, dms.dungeon.tier), ...rewards } }; dms.quests.records[id] = quest; record(dms, `Created ${category} Quest: ${clean(titleText)}.`); return quest;\n  }\n  function completeQuest(dms, questId) { const quest = dms.quests.records[clean(questId)]; if (!quest) throw new Error("Unknown Quest."); if (!questPrerequisitesMet(dms, quest)) throw new Error("Quest prerequisites are not cleared."); if (quest.status === "locked") quest.status = "active"; if (quest.status !== "active") throw new Error("Unknown or inactive Quest."); quest.status = "cleared"; const levels = awardQuest(dms, quest); for (const candidate of Object.values(dms.quests.records)) if (candidate.status === "locked" && questPrerequisitesMet(dms, candidate)) candidate.status = "active"; record(dms, `Completed ${quest.category || "Dungeon"} Quest: ${quest.title}.`); return { quest, levels }; }',
  "quest prerequisites"
);

fs.writeFileSync(file, source);
console.log("Completed DMS foundation safeguards.");
