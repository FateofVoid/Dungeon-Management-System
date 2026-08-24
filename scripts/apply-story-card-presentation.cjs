const fs = require("node:fs");

const file = process.argv[2];
const reserveCount = Math.max(0, Number(process.argv[3]) || 0);
if (!file) throw new Error("Usage: node scripts/apply-story-card-presentation.cjs <story-cards.json> [hidden-save-reserve-count]");

const cards = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(cards)) throw new Error("Story Card export must be a JSON array.");

const dungeonStatus = cards.find(card => card.keys === "DMS_SYS_DUNGEON_STATUS");
const dungeonTier = Number(String(dungeonStatus?.value || "").match(/Dungeon:.*?\|\s*Tier\s+(\d+)/i)?.[1]) || 0;

for (const card of cards) {
  const key = String(card.keys || "");
  if (key.startsWith("DMS_SAVE_")) {
    card.showInStoryCards = false;
    card.isSpoiler = false;
  } else if (key === "DMS_SYS_IDENTITY") {
    card.showInStoryCards = false;
    card.isSpoiler = false;
  } else if (key.startsWith("DMS_FACILITY_UNLOCK_")) {
    const unlockTier = Number(String(card.value || "").match(/Unlocked at Dungeon Tier\s+(\d+)/i)?.[1]);
    const unlocked = Number.isFinite(unlockTier) && unlockTier <= dungeonTier;
    card.showInStoryCards = unlocked;
    card.isSpoiler = !unlocked;
  } else if (key.startsWith("DMS_QUEST_")) {
    const status = String(card.value || "").match(/^Status:\s*(\w+)/im)?.[1]?.toLowerCase();
    card.showInStoryCards = status === "active";
    card.isSpoiler = status === "locked";
  }
}

for (let index = 1; index <= reserveCount; index++) {
  const key = `DMS_SAVE_RESERVE_${index}`;
  if (cards.some(card => String(card.keys || "").split(",").map(value => value.trim()).includes(key))) continue;
  cards.push({
    isSpoiler: false,
    showInStoryCards: false,
    keys: key,
    value: "Reserved hidden DMS save-card slot.",
    type: "System — DMS Reserve",
    title: key,
    description: "Hidden reserve claimed by DMS only when another compact save chunk is required.",
    useForCharacterCreation: false
  });
}

if (reserveCount) {
  Object.assign(global, { state: {}, storyCards: [], history: [], info: {}, log: () => {}, text: "", stop: false });
  const DMS = require("../Library.js");
  const dms = DMS.defaultState();
  for (const [definitionKey, definition] of Object.entries(DMS.ROOM_DEFINITIONS)) {
    if (definition.unlockTier <= 0) continue;
    const key = `DMS_FACILITY_UNLOCK_${definitionKey.toUpperCase().replace(/\W/g, "_")}`;
    if (cards.some(card => card.keys === key)) continue;
    cards.push({ isSpoiler: true, showInStoryCards: false, keys: key, value: `${definition.name}\nUnlocked at Dungeon Tier ${definition.unlockTier}.\nFunction: ${definition.function}\nJob Name: ${definition.job}\nAppearance: Defined only when constructed from the dungeon theme and style.${definition.researchRequired ? "\nResearch Required: Yes." : ""}`, type: "System — Locked Facilities", title: `DMS Facility Unlock — ${definition.name}`, description: "Hidden until the Dungeon reaches this facility's unlock Tier.", useForCharacterCreation: false });
  }
  for (const [questId, quest] of Object.entries(dms.quests.records)) {
    const key = `DMS_QUEST_${questId.toUpperCase().replace(/\W/g, "_")}`;
    if (cards.some(card => card.keys === key)) continue;
    const active = quest.status === "active";
    cards.push({ isSpoiler: !active, showInStoryCards: active, keys: key, value: `${quest.title}\nCategory: ${quest.category || "Dungeon"}\nChain: ${quest.chain || "Independent"}${quest.step ? `, Step ${quest.step}` : ""}\nTier: ${quest.tier ?? 0}\nStatus: ${active ? "Active" : "Locked"}\nPrerequisites: ${(quest.prerequisites || []).join(", ") || "None"}\nObjective: ${quest.objective}\nRewards: ${JSON.stringify(quest.rewards || {})}`, type: active ? "Active Quests" : "System — Locked Quests", title: `DMS Quest — ${quest.title}`, description: active ? "Current immersive DMS quest." : "Hidden until its prerequisites are satisfied.", useForCharacterCreation: false });
  }
}

fs.writeFileSync(file, `${JSON.stringify(cards, null, 2)}\n`);
