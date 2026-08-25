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
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic command energy.", "Drawn through the throne.", "Primary Dungeon currency."]);
  DMS.confirmAptitudes(dms);
  return dms;
}

function rich(dms, amount = 100000) {
  for (const role of DMS.RESOURCE_ROLES) {
    const resource = dms.dungeon.resources[role];
    resource.amount = amount;
    if (resource.graded) resource.grades.Basic = amount;
  }
  return dms;
}

function systemMode(dms) {
  DMS.setLocation(dms, "Dungeon", "Throne Room");
  DMS.setActivity(dms, "System", [], "Timeless");
  return dms;
}

function awakenTier1() {
  const dms = rich(systemMode(configured()));
  DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  DMS.upgradeDungeon(dms);
  return dms;
}

test("facilities separate stable System definitions from manifested room and job names", () => {
  const dms = awakenTier1();
  const room = DMS.createRoom(dms, "material-works");
  assert.equal(room.definition, "material-works");
  assert.equal(room.systemName, "Material Works");
  assert.notEqual(room.name, room.systemName);
  assert.notEqual(room.jobName, DMS.ROOM_DEFINITIONS[room.definition].job);
  assert.match(room.lore.function, /System function "Material Works"/);
  assert.equal(DMS.renderQuestText(dms, dms.quests.records["tier1-main-construction"], "Use {room:material-works}, employ {job:material-works}, and collect {resource:construction}."), `Use "${room.name}", employ "${room.jobName}", and collect "Graveglass".`);
});

test("causal quest chains activate a satisfied next step before they can clear it", () => {
  const dms = awakenTier1();
  dms.quests.records["story-awakening-1"].status = "cleared";
  DMS.updateQuests(dms, { notify: false });
  assert.equal(dms.quests.records["tier1-main-sustenance"].status, "active");
  assert.equal(dms.quests.records["tier1-main-workers"].status, "locked");
  dms.milestones.tier1.stableWorkerSupport = true;
  dms.milestones.tier1.produced.sustenance = 1;
  DMS.updateQuests(dms, { notify: false });
  assert.equal(dms.quests.records["tier1-main-sustenance"].status, "cleared");
  assert.equal(dms.quests.records["tier1-main-workers"].status, "active", "a pre-satisfied locked step must be presented before completion");
});

test("Tier 1 Class Awakening states and enforces initial selection requirements", () => {
  const dms = awakenTier1();
  assert.equal(dms.thronebound.class.name, "Classless");
  assert.equal(dms.classPreviews.thronebound.length, 3);
  assert.match(DMS.classSelectionRequirementsStatus(dms), /Dungeon Tier 1[\s\S]*three generated Class previews[\s\S]*20 Basic Sovereign Ichor[\s\S]*15 Pyreflow/);
  assert.throws(() => DMS.acceptClassPreview(dms, "thronebound", 1), /Review the three Class previews/);
  DMS.classPreviewsStatus(dms, "thronebound", true);
  const selected = DMS.acceptClassPreview(dms, "thronebound", 1);
  assert.equal(selected.class.tier, 1);
  assert.equal(selected.class.lineage.length, 1);
  assert.equal(selected.class.skills.length, 2);
  assert.equal(selected.class.traits.length, 1);
});

test("Guild and Bounty field objectives require a manual Guild report before rewards", () => {
  global.storyCards.length = 0;
  global.storyCards.push({ title: "Ash Maw", keys: "ash maw", entry: "A known monster." });
  const dms = configured();
  DMS.setLocation(dms, "Lustria", "Cinder March");
  DMS.setActivity(dms, "Exploration", [], "Slow");
  const bounty = DMS.createQuest(dms, "Bounty", "Cinder March Investigation", "Investigate the tracks without assuming their cause.", { experience: 20, marks: 5 }, [], {
    chain: "Cinder March Contract", step: 1, missionType: "Bounty", strictTemplate: true, reportLocation: "Guild Hall",
    references: [{ type: "story-card", id: "ash maw", title: "Ash Maw", role: "target" }],
    triggerGroups: [{ all: ["investigate", "tracks"] }]
  });
  const beforeXp = dms.thronebound.experience, beforeMarks = dms.currencies.marks;
  const field = DMS.processQuestAction(dms, "I investigate the tracks.", { outcome: { kind: "monster", reference: bounty.references[0] } });
  assert.deepEqual(field.awaitingReport, [bounty.id]);
  assert.equal(bounty.status, "active");
  assert.equal(bounty.fieldComplete, true);
  assert.equal(dms.thronebound.experience, beforeXp);
  assert.throws(() => DMS.completeQuest(dms, bounty.id), /reported to the Guild/);
  assert.throws(() => DMS.reportQuest(dms, bounty.id), /at Guild Hall/);
  DMS.setLocation(dms, "Lustria", "Adventurers' Guild Hall");
  const reportAction = DMS.applyActivityTurn(dms, "I report the completed bounty to the Guild clerk and submit my proof.", 101);
  assert.match(reportAction.note, /formally reported to the Guild/);
  assert.equal(bounty.status, "cleared");
  assert.equal(bounty.reported, true);
  assert.ok(dms.thronebound.experience > beforeXp);
  assert.ok(dms.currencies.marks > beforeMarks);
  const followup = dms.quests.records[bounty.followupQuestId];
  assert.equal(followup.missionType, "Hunt");
  assert.equal(followup.reportRequired, true);
  DMS.refreshCards(dms);
  assert.ok(DMS.assertSaveCardCharacterLimits().maximum <= DMS.SAVE_CARD_MAX);
  const restored = DMS.loadSaveCards(DMS.defaultState());
  assert.equal(restored.quests.records[bounty.id].reported, true);
  assert.equal(restored.quests.records[bounty.id].outcome.kind, "monster");
  assert.equal(restored.quests.records[bounty.followupQuestId].missionType, "Hunt");
});

test("monster discoveries do not force Hunt followups for Escort or Exploration missions", () => {
  global.storyCards.length = 0;
  global.storyCards.push({ title: "Road Beast", keys: "road beast", entry: "A known creature." });
  const dms = configured();
  DMS.setLocation(dms, "Lustria", "Guild Hall");
  DMS.setActivity(dms, "Exploration", [], "Slow");
  const escort = DMS.createQuest(dms, "Guild", "Caravan Escort", "Escort the caravan to its destination.", {}, [], {
    missionType: "Escort", reportLocation: "Guild Hall", triggerGroups: [{ all: ["escort", "caravan"] }], references: [{ type: "story-card", id: "road beast", title: "Road Beast", role: "target" }]
  });
  DMS.processQuestAction(dms, "I escort the caravan.", { outcome: { kind: "monster", reference: escort.references[0] } });
  const result = DMS.reportQuest(dms, escort.id);
  assert.equal(result.followup, null);
  assert.equal(escort.followupQuestId, "");
});

test("Bond begins at Tier 1 and creates normalized, persistent Bond Event quests", () => {
  const tier0 = rich(systemMode(configured())), manager = DMS.summonAdministrator(tier0, "Veyra", "Ashborn");
  assert.throws(() => DMS.addAdministratorBond(tier0, manager.id, 5), /Tier 1/);
  DMS.upgradeDungeon(tier0);
  DMS.addAdministratorBond(tier0, manager.id, 100);
  const quest = tier0.quests.records[`bond-${manager.id}-5`];
  assert.equal(quest.chain, "Veyra Bond");
  assert.equal(quest.dynamic, true);
  assert.equal(quest.references[0].role, "bond");
  assert.match(DMS.renderQuestText(tier0, quest, quest.objective), /Veyra/);
});

test("direct slash completion is disabled and strict templates reject assumed or unmanifested outcomes", () => {
  const dms = configured();
  assert.throws(() => DMS.execute(dms, "/dms quest complete story-awakening-1"), /Direct Quest completion is disabled/);
  assert.throws(() => DMS.createQuest(dms, "Dungeon", "Generic Workers", "Send workers to the Material Works.", {}, [], { strictTemplate: true }), /unmanifested population vocabulary|presentation token/);
  assert.throws(() => DMS.createQuest(dms, "Personal", "Certain Culprit", "Find the creature causing the damage.", {}, [], { strictTemplate: true }), /assumes an unresolved outcome/);
});
