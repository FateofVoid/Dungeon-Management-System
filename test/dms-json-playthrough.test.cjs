const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.state = {};
global.storyCards = [];
global.history = [];
global.info = { actionCount: 0, maxChars: 12000 };
global.log = () => {};
global.text = "";
global.stop = false;
const DMS = require("../Library.js");

const samplePath = path.join(__dirname, "fixtures", "dungeon-generator-sample.json");
const sampleJson = fs.readFileSync(samplePath, "utf8");

function placeholders() {
  return [{ question: DMS.DMS_INITIALIZATION_QUESTION, answer: sampleJson }];
}

function finishTasks(dms, limit = 200) {
  while (dms.tasks.length && limit-- > 0) DMS.resolveCycle(dms);
  assert.ok(limit > 0, "all scheduled Tier 1 tasks must complete through ordinary Cycles");
}

function build(dms, definition) {
  const room = DMS.createRoom(dms, definition);
  finishTasks(dms);
  assert.equal(room.state, "Active");
  return room;
}

test("sample Dungeon Generator JSON plays from Tier 0 through the Tier 2 upgrade boundary", () => {
  global.storyCards.length = 0;
  const dms = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders()), true);
  assert.equal(dms.initialized, true);
  assert.equal(dms.dungeon.name, "Queen's Vault");
  assert.equal(dms.thronebound.name, "Mara-Veil");
  assert.equal(dms.dungeon.contentPolicy.kink, "Adult fetish themes may appear only when initiated by the player.");
  assert.equal(dms.world.homeworldTimePeriod, "The 312th Year of the Tempest Concord");
  assert.deepEqual(Object.keys(dms.rooms), ["room-throne"]);
  assert.equal(dms.dungeon.tier, 0);

  let action = 1;
  const act = text => DMS.applyActivityTurn(dms, text, action++);
  assert.match(act('> You say, "System, show my Dungeon Status."').system, /Dungeon: Queen's Vault/);
  assert.match(act('> You say, "System, show my resources."').system, /Construction — Vowglass/);
  assert.match(act('> You say, "System, enter management mode."').system, /Activity: System \/ Timeless/);
  assert.match(act('> You say, "System, summon the Manager."').system, /Manager/);
  assert.match(act('> You ask, "System, what is required to awaken Tier 1?"').system, /Administrator Capacity 1\/1 filled/);
  assert.match(act('> You say, "System, awaken Tier 1."').system, /Dungeon advanced to Tier 1/);
  assert.equal(dms.dungeon.tier, 1);
  assert.equal(dms.dungeon.administratorCapacity, 3);
  assert.equal(dms.thronebound.class.name, "Classless");

  const material = build(dms, "material-works");
  for (let index = 0; index < 4; index++) DMS.resolveCycle(dms);
  build(dms, "sustenance-works");
  const habitat = build(dms, "worker-habitat");
  build(dms, "development-sanctum");
  build(dms, "energy-conduit");
  for (let index = 0; index < 25; index++) DMS.resolveCycle(dms);

  DMS.expandRoom(dms, habitat.id);
  finishTasks(dms);
  DMS.facilityTierStatus(dms, true);
  const manager = Object.values(dms.administrators)[0];
  DMS.assignAdministrator(dms, manager.id, material.id);
  DMS.resolveCycle(dms);
  DMS.acceptClassPreview(dms, "thronebound", 1);

  const quarters = build(dms, "administrator-quarters");
  const chamber = build(dms, "thronebound-private-chamber");
  build(dms, "class-evolution-chamber");
  build(dms, "general-skill-hall");
  build(dms, "general-trait-archive");
  const second = DMS.summonAdministrator(dms, "Ilyra", "Veiled Court");
  const third = DMS.summonAdministrator(dms, "Caelis", "Veiled Court");
  DMS.assignResidence(dms, second.id, quarters.id);
  DMS.assignPrivateStay(dms, second.id, chamber.id);
  const skill = DMS.buyShopEntry(dms, "thronebound", "skill", 1, 1);
  const trait = DMS.buyShopEntry(dms, "thronebound", "trait", 1, 1);
  assert.ok(dms.thronebound.class.skills.some(item => item.name === skill.name));
  assert.ok(dms.thronebound.class.traits.some(item => item.name === trait.name));
  assert.equal(Object.keys(dms.administrators).length, 3);
  assert.equal(third.level, 1);

  let guard = 200;
  while (dms.quests.records["tier1-main-reserve"].status !== "cleared" && guard-- > 0) DMS.resolveCycle(dms);
  assert.ok(guard > 0, "ordinary Tier 1 production must fund the Tier 2 threshold");
  assert.equal(dms.quests.records["tier1-main-reserve"].status, "cleared");
  assert.equal(dms.quests.records["main-dungeon-tier-1"].status, "cleared");
  assert.ok(dms.dungeon.resources.construction.grades.Basic >= DMS.tierRules(2).upgradeCost.construction);
  assert.ok(dms.dungeon.resources.energy.amount >= DMS.tierRules(2).upgradeCost.energy);
  assert.match(DMS.tierRequirementsStatus(dms), /Tier 2 requirements remain sealed/);
  assert.throws(() => DMS.upgradeDungeon(dms), /Tier 2 remains sealed/);
  assert.equal(dms.dungeon.tier, 1);

  DMS.refreshCards(dms);
  const limit = DMS.assertSaveCardCharacterLimits();
  assert.ok(limit.maximum <= DMS.SAVE_CARD_MAX);
  const loaded = DMS.loadSaveCards(undefined, DMS.readSaveCards());
  assert.equal(loaded.dungeon.name, "Queen's Vault");
  assert.equal(loaded.thronebound.class.lineage.length, 1);
  assert.equal(Object.keys(loaded.administrators).length, 3);
  assert.equal(loaded.quests.records["tier1-main-reserve"].status, "cleared");
  assert.equal(loaded.onboarding.scenarioVariableSignature, dms.onboarding.scenarioVariableSignature);
});
