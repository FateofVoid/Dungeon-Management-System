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
  DMS.configure(dms, { thronebound: "Mara", race: "Voidkin", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic basalt fortress", populationNature: "Ashbound undead", populationAppearance: "Masked skeletons veined with ember light.", homeworld: "Caelus", homeworldDescription: "A storm-wrapped world of floating basalt kingdoms.", homeworldAnchor: "Mara's obsidian estate", growthPreferences: ["Might", "Endurance", "Command", "Logistics", "Insight"], secondaryLocation: "The Crossroads" });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal.", "Quarried from ossuary flows.", "Shapes rooms and fortifications."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass.", "Rendered from char gardens.", "Sustains the dungeon population."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence.", "Refined from resonance.", "Develops linked characters."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic command energy.", "Drawn through the throne.", "Primary dungeon currency."]);
  DMS.confirmAptitudes(dms);
  return dms;
}

function systemMode(dms) {
  DMS.setLocation(dms, "Dungeon", "Throne Room");
  DMS.setActivity(dms, "System", [], "Timeless");
  return dms;
}

test("save-card recovery reapplies Thronebound and Administrator mechanical progression", () => {
  global.storyCards.length = 0;
  const dms = systemMode(configured());
  const admin = DMS.summonAdministrator(dms, "Veyra", "Ashborn");

  dms.thronebound.class = {
    name: "Ash Sovereign",
    description: "A sovereign class that commands pyre-bound domains.",
    tier: 2,
    skills: [{ name: "Pyre Cut", description: "Cuts with compressed pyreflow.", category: "combat", tier: 2, mastery: 47, grade: 2, gradeName: "Advanced", source: "Class" }],
    traits: [{ name: "Cinder Crown", description: "Stabilizes command over ashbound forces.", tier: 2, mastery: 63, grade: 2, gradeName: "Advanced", source: "Class" }]
  };
  admin.class = {
    name: "Ember Castellan",
    description: "A fortress-management class bound to ember wards.",
    tier: 2,
    skills: [{ name: "Ward Routing", description: "Routes ward pressure across facilities.", category: "management", tier: 2, mastery: 71, grade: 3, gradeName: "Expert", source: "Class" }],
    traits: [{ name: "Basalt Memory", description: "Retains structural command patterns.", tier: 2, mastery: 38, grade: 2, gradeName: "Advanced", source: "Class" }]
  };
  const attributeGroup = admin.attributes[admin.attributeSpecialization];
  const firstAttribute = Object.keys(attributeGroup)[0];
  attributeGroup[firstAttribute].value = 37;

  DMS.refreshCards(dms);
  const snapshot = DMS.readSaveCards();
  const loaded = DMS.loadSaveCards(configured(), snapshot);
  const restoredAdmin = loaded.administrators[admin.id];

  assert.equal(loaded.thronebound.class.name, "Ash Sovereign");
  assert.equal(loaded.thronebound.class.skills[0].mastery, 47);
  assert.equal(loaded.thronebound.class.skills[0].description, "Cuts with compressed pyreflow.");
  assert.equal(loaded.thronebound.class.traits[0].grade, 2);
  assert.equal(restoredAdmin.class.name, "Ember Castellan");
  assert.equal(restoredAdmin.class.skills[0].mastery, 71);
  assert.equal(restoredAdmin.class.skills[0].description, "Routes ward pressure across facilities.");
  assert.equal(restoredAdmin.attributes[admin.attributeSpecialization][firstAttribute].value, 37);
});

test("Lustrian inventory mutations use the centralized transaction ledger", () => {
  const dms = configured();
  const changes = DMS.transactInventory(dms, { "Lustrian Iron": 5 }, "test-extraction");
  assert.deepEqual(changes["Lustrian Iron"], { before: 0, delta: 5, after: 5 });
  assert.equal(dms.resourceTransactions.at(-1).kind, "inventory");
  assert.equal(dms.resourceTransactions.at(-1).context, "test-extraction");
});

test("slash commands are retry-safe for the same AI Dungeon action", () => {
  global.storyCards.length = 0;
  global.state = { DMS: systemMode(configured()) };
  global.info = { actionCount: 501, maxChars: 12000 };
  global.text = "/dms cycle";
  global.DungeonManagement("input");
  const afterFirst = global.state.DMS.activity.cycle;
  global.DungeonManagement("output");

  global.text = "/dms cycle";
  global.DungeonManagement("input");
  assert.equal(global.state.DMS.activity.cycle, afterFirst);
  assert.match(global.state.DMSCommandOutput, /already applied/i);
  global.DungeonManagement("output");
});

test("the live cache-reset diagnostic preserves save cards and automatically recovers before output", () => {
  global.storyCards.length = 0;
  const dms = systemMode(configured());
  const admin = DMS.summonAdministrator(dms);
  DMS.refreshCards(dms);
  const expected = { revision: dms.persistence.revision, tier: dms.dungeon.tier, manager: admin.name, rank: admin.rank, bond: admin.bond.value };
  global.state = { DMS: dms };
  global.info = { actionCount: 777, maxChars: 12000 };
  global.text = '> You say, "/dms cache reset"';
  global.DungeonManagement("input");
  assert.equal(global.state.DMS, undefined);
  global.DungeonManagement("context");
  assert.equal(global.state.DMS.persistence.revision, expected.revision);
  assert.equal(global.state.DMS.dungeon.tier, expected.tier);
  const restored = Object.values(global.state.DMS.administrators)[0];
  assert.equal(restored.name, expected.manager);
  assert.equal(restored.rank, expected.rank);
  assert.equal(restored.bond.value, expected.bond);
  global.DungeonManagement("output");
  assert.match(global.text, /Runtime cache removed/);
});
