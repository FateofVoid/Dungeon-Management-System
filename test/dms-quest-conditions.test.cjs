const test = require("node:test");
const assert = require("node:assert/strict");

global.state = {};
global.storyCards = [];
global.history = [];
global.info = { actionCount: 0, maxChars: 12000 };
global.log = () => {};
global.text = "";
global.stop = false;
const DMS = require("../Library.js");

function configured() {
  const dms = DMS.defaultState();
  DMS.configure(dms, {
    thronebound: "Mara", race: "Voidkin", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic basalt fortress",
    populationNature: "Ashbound undead", populationAppearance: "Masked skeletons veined with ember light.", homeworld: "Caelus",
    homeworldDescription: "A storm-wrapped world of floating basalt kingdoms.", homeworldAnchor: "Mara's obsidian estate",
    growthPreferences: ["Might", "Endurance", "Command", "Logistics", "Insight"]
  });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal.", "Quarried from ossuary flows.", "Builds facilities."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass.", "Rendered from char gardens.", "Sustains cohorts."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence.", "Refined from resonance.", "Develops linked characters."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic command energy.", "Drawn through the throne.", "Primary dungeon currency."]);
  DMS.confirmAptitudes(dms);
  dms.quests.notifications.length = 0;
  return dms;
}

test("System concepts recognize unordered terms, punctuation, narrative framing, and basic plurals", () => {
  const statusPhrases = [
    "System Status.",
    "Open the System Status.",
    "Status, System.",
    "I sit before the Throne and command, ‘System Status open.’",
    "I ask the System to show my status.",
    "Dungeon Status"
  ];
  for (const phrase of statusPhrases) assert.equal(DMS.naturalSystemCommand(phrase), "status", phrase);
  assert.equal(DMS.naturalSystemCommand("System, display the Dungeon's resources."), "resources");
  assert.equal(DMS.naturalSystemCommand("Open Facilities."), "facilities");
  assert.equal(DMS.naturalSystemCommand("I discuss the dungeon's status with the Manager during dinner."), "", "long narration without an interface address or command verb remains narration");
  assert.equal(DMS.triggerGroupsMatch("Status, SYSTEM!", [{ all: ["system", "status"] }]), true);
  assert.equal(DMS.triggerGroupsMatch("Open the facilities", [{ all: ["facility"] }]), true, "basic pluralization is normalized");
  assert.equal(DMS.triggerGroupMatches("inspect the sealed door", { all: ["door"], any: ["look", "inspect", "study"], none: ["ignore", "leave"] }), true);
});

test("a tutorial completes only after the recognized System operation succeeds in valid context", () => {
  const dms = configured();
  DMS.setLocation(dms, "Homeworld", "Caelus");
  const refused = DMS.applyActivityTurn(dms, "System, display my current Status.", 1);
  assert.match(refused.system, /Return to the Throne Room/);
  assert.equal(dms.quests.records["tutorial-system-status"].status, "active");

  DMS.setLocation(dms, "Dungeon", "Throne Room");
  const experience = dms.thronebound.experience;
  const accepted = DMS.applyActivityTurn(dms, "I ask the System to show my Status.", 2);
  assert.match(accepted.system, /Dungeon: The Ashen Court/);
  assert.match(accepted.system, /Quest Complete — Read Dungeon Status/);
  assert.match(accepted.system, /Next Quest: Read Resource State/);
  assert.equal(dms.quests.records["tutorial-system-status"].status, "cleared");
  assert.equal(dms.thronebound.experience, experience + 10);

  const retry = DMS.applyActivityTurn(dms, "I ask the System to show my Status.", 2);
  assert.equal(retry.repeated, true);
  assert.equal(retry.system, accepted.system);
  assert.equal(dms.thronebound.experience, experience + 10, "retry cannot duplicate the Tutorial reward");
});

test("Tutorial Story Cards separate education, key terms, and mechanical objective", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  const card = global.storyCards.find(item => item.keys === "DMS_QUEST_TUTORIAL_SYSTEM_STATUS");
  assert.ok(card);
  assert.match(card.entry, /Purpose[\s\S]*How to Use[\s\S]*Requirements[\s\S]*Key Terms[\s\S]*Why It Matters[\s\S]*Objective/);
  assert.match(card.entry, /"system" \+ "status"/i);
  assert.doesNotMatch(card.entry, /Say, [‘']System/i);
  assert.ok(card.entry.length <= 2000);
});

test("staged quests use stable known IDs, exact context, and persist their progress schema", () => {
  global.storyCards.length = 0;
  const dms = configured();
  dms.world.lustria.sectors["sector-7"] = { id: "sector-7", name: "Glasswild Reach", threat: 1, status: "Accessible", veins: [] };
  assert.throws(() => DMS.createQuest(dms, "Personal", "Unknown Place", "Investigate it.", {}, [], { references: [{ type: "sector", id: "sector-missing" }] }), /not currently known/);
  const quest = DMS.createQuest(dms, "Personal", "Survey the Glasswild Reach", "Survey the Reach, examine its landmark, and preserve the result.", { experience: 20 }, [], {
    description: "A distant crystalline pulse repeats beneath the mapped horizon.",
    references: [{ type: "sector", id: "sector-7" }],
    requiredConditions: { location: { major: "Lustria", secondary: "Glasswild Reach" }, activityMode: "Exploration" },
    stages: [
      { id: "survey", title: "Survey the Reach", triggerGroups: [{ any: ["survey", "scout", "observe"] }] },
      { id: "landmark", title: "Examine the Glass Spire", triggerGroups: [{ any: ["investigate", "inspect", "examine"], all: ["glass spire"] }] }
    ],
    completionText: "The Reach resolves into a coherent entry within the Dungeon's memory."
  });
  DMS.processQuestAction(dms, "I survey the horizon.");
  assert.equal(quest.progress.stage, 0, "correct words in the wrong context do not progress the quest");
  DMS.setLocation(dms, "Lustria", "Glasswild Reach");
  DMS.setActivity(dms, "Exploration", ["sector-7"], "Slow");
  DMS.processQuestAction(dms, "I scout and survey the entire Reach.");
  assert.equal(quest.progress.stage, 1);
  dms.world.lustria.sectors["sector-7"].name = "Prismatic Expanse";
  assert.equal(DMS.questReference(dms, quest.references[0]).label, "Prismatic Expanse", "presentation follows the canonical entity while mechanics retain sector-7");
  DMS.processQuestAction(dms, "I investigate the Glass Spire closely.");
  assert.equal(quest.status, "cleared");
  assert.equal(quest.progress.stage, 2);

  DMS.refreshCards(dms);
  assert.ok(DMS.assertSaveCardCharacterLimits().maximum <= DMS.SAVE_CARD_MAX);
  const loaded = DMS.loadSaveCards(DMS.defaultState());
  assert.equal(loaded.quests.records[quest.id].status, "cleared");
  assert.deepEqual(loaded.quests.records[quest.id].progress, quest.progress);
  assert.equal(loaded.quests.records[quest.id].references[0].id, "sector-7");
  assert.equal(loaded.quests.records[quest.id].stages.length, 2);
});

test("normal story output receives one immersive quest transition notification", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.setLocation(dms, "Lustria", "Ash Quarry");
  DMS.setActivity(dms, "Exploration", [], "Slow");
  const quest = DMS.createQuest(dms, "Personal", "Voice Beneath the Quarry", "Investigate the sound beneath the quarry.", { experience: 5 }, [], {
    requiredConditions: { location: { major: "Lustria", secondary: "Ash Quarry" }, activityMode: "Exploration" },
    triggerGroups: [{ all: ["investigate"], any: ["sound", "voice", "knocking"] }],
    completionText: "The rhythm beneath the stone resolves into a known cause."
  });
  dms.quests.notifications.length = 0;
  global.state = { DMS: dms };
  global.info = { actionCount: 800, maxChars: 12000 };
  global.text = "I investigate the strange knocking sound beneath the quarry.";
  global.DungeonManagement("input");
  global.text = "Dust falls as the hidden chamber opens.";
  global.DungeonManagement("output");
  assert.equal(global.state.DMS.quests.records[quest.id].status, "cleared");
  assert.match(global.text, /The rhythm beneath the stone resolves into a known cause/);
  assert.match(global.text, /Quest Complete — Voice Beneath the Quarry/);

  global.text = "I investigate the strange knocking sound beneath the quarry.";
  global.DungeonManagement("input");
  global.text = "The same moment is retried.";
  global.DungeonManagement("output");
  assert.doesNotMatch(global.text, /Quest Complete/);
});

test("contextual generic quest cards appear only after their category becomes relevant", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  assert.equal(global.storyCards.some(card => card.keys === "DMS_QUEST_GENERIC_BOND" && card.showInStoryCards), false);
  DMS.setActivity(dms, "System", [], "Timeless");
  DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  DMS.refreshCards(dms);
  const bond = global.storyCards.find(card => card.keys === "DMS_QUEST_GENERIC_BOND");
  assert.ok(bond?.showInStoryCards);
  assert.match(bond.entry, /No Unresolved Bond Event/);
  assert.equal(global.storyCards.some(card => card.keys === "DMS_QUEST_GENERIC_GUILD" && card.showInStoryCards), false, "Guild remains irrelevant at Tier 0 without Guild knowledge or contact");
});
