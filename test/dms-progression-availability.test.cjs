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
  DMS.configure(dms, { thronebound: "Mara", race: "Voidkin", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic basalt", populationNature: "Ashbound", populationAppearance: "Masked figures veined with ember light.", homeworld: "Caelus", homeworldDescription: "A storm-wrapped world.", homeworldAnchor: "Obsidian Estate", growthPreferences: ["Might", "Command", "Logistics"] });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal.", "Quarried from ossuary flows.", "Builds facilities."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass.", "Rendered from char gardens.", "Sustains cohorts."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence.", "Refined from resonance.", "Develops linked characters."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic command energy.", "Drawn through the throne.", "Primary dungeon currency."]);
  DMS.confirmAptitudes(dms);
  return dms;
}

function setStock(dms, amount) {
  for (const role of DMS.RESOURCE_ROLES) {
    const resource = dms.dungeon.resources[role];
    resource.amount = amount;
    if (resource.graded) resource.grades = { Basic: amount, Intermediate: 0, Advanced: 0, Mastery: 0 };
  }
}

function tierOne(dms) {
  DMS.setLocation(dms, "Dungeon", "Throne Room");
  DMS.setActivity(dms, "System", [], "Timeless");
  setStock(dms, 10000);
  DMS.summonAdministrator(dms, "Veyra", "Ashbound");
  DMS.upgradeDungeon(dms);
  return dms;
}

function finishTasks(dms) {
  let guard = 50;
  while (dms.tasks.length && guard-- > 0) DMS.resolveCycle(dms);
  assert.ok(guard > 0, "task completion guard exhausted");
}

test("construction options expose only current progression and retain blocked and completed states", () => {
  const dms = configured();
  assert.deepEqual(DMS.constructionOptions(dms), []);
  assert.throws(() => DMS.execute(dms, "/dms room list"), /not available in the current progression/);

  tierOne(dms);
  setStock(dms, 0);
  const options = DMS.constructionOptions(dms);
  assert.ok(options.some(option => option.definitionKey === "material-works" && option.state === "Requires Resources"));
  assert.ok(options.every(option => option.definition.unlockTier <= 1));
  assert.ok(!options.some(option => option.definitionKey === "barracks"));
  assert.match(DMS.constructionOptionsStatus(dms), /room-1 \[Requires Resources\].*Material Works/);
  assert.throws(() => DMS.createRoom(dms, "room-1"), /Insufficient resources/);
  assert.equal(dms.tasks.length, 0);
  assert.ok(!Object.values(dms.rooms).some(room => room.definition === "material-works"));

  setStock(dms, 10000);
  const room = DMS.createRoom(dms, "room-1");
  assert.equal(room.definition, "material-works");
  assert.equal(DMS.roomAvailability(dms, "material-works").state, "Under Construction");
  assert.throws(() => DMS.createRoom(dms, "material-works"), /already has construction work in progress/);
  finishTasks(dms);
  assert.equal(DMS.roomAvailability(dms, "material-works").state, "Constructed");
  assert.match(DMS.constructionOptionsStatus(dms), /room-1 \[Constructed\]/);
});

test("facility and shop cards stay hidden until relevant and mark purchased entries", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  const material = global.storyCards.find(card => card.keys === "DMS_FACILITY_UNLOCK_MATERIAL_WORKS");
  const barracks = global.storyCards.find(card => card.keys === "DMS_FACILITY_UNLOCK_BARRACKS");
  assert.equal(material.showInStoryCards, false);
  assert.equal(barracks.showInStoryCards, false);
  assert.equal(global.storyCards.some(card => card.keys === "DMS_SYS_CONSTRUCTION_OPTIONS"), false);

  tierOne(dms);
  DMS.refreshCards(dms);
  assert.equal(material.showInStoryCards, true);
  assert.equal(barracks.showInStoryCards, false);
  assert.match(material.entry, /Manifested Name:[\s\S]*Construction Requirements:[\s\S]*Planned Appearance:/);
  assert.ok(material.entry.length < 2000);
  assert.ok(global.storyCards.find(card => card.keys === "DMS_SYS_CONSTRUCTION_OPTIONS").entry.length < 2000);

  DMS.classPreviewsStatus(dms, "thronebound", true);
  DMS.acceptClassPreview(dms, "thronebound", 1);
  assert.equal(global.storyCards.some(card => String(card.keys).startsWith("DMS_CLASS_PREVIEW_THRONEBOUND_")), false, "accepted previews are no longer relevant player options");

  const hall = DMS.createRoom(dms, "general-skill-hall");
  DMS.refreshCards(dms);
  assert.equal(global.storyCards.some(card => card.keys === "DMS_GENERAL_SKILL_SHOP_T1"), false, "a constructing shop facility exposes no entries");
  finishTasks(dms);
  DMS.refreshCards(dms);
  let shop = global.storyCards.find(card => card.keys === "DMS_GENERAL_SKILL_SHOP_T1");
  assert.match(shop.entry, /\[Available\] Measured Strike 1/);
  DMS.buyShopEntry(dms, "thronebound", "skill", 1, 1);
  DMS.refreshCards(dms);
  shop = global.storyCards.find(card => card.keys === "DMS_GENERAL_SKILL_SHOP_T1");
  assert.match(shop.entry, /\[Purchased\] Measured Strike 1/);
  assert.ok(shop.entry.length < 2000);
  assert.throws(() => DMS.buyShopEntry(dms, "thronebound", "skill", 1, 1), /Duplicate Skill/);
  assert.equal(hall.state, "Active");
});

test("ordinary prose management attempts produce an authoritative narrative result", () => {
  const dms = tierOne(configured());
  setStock(dms, 0);
  assert.equal(DMS.narrativeManagementCommand("I build room-1."), "room build room-1");
  const blocked = DMS.applyActivityTurn(dms, "I build room-1.", 11);
  assert.equal(blocked.narrativeResolution.success, false);
  assert.match(blocked.narrativeResolution.reason, /Insufficient resources/);
  assert.match(DMS.narrativeResolutionText(blocked.narrativeResolution), /NOT PERFORMED[\s\S]*No task began[\s\S]*Do not contradict/);
  assert.equal(dms.tasks.length, 0);

  setStock(dms, 10000);
  const accepted = DMS.applyActivityTurn(dms, "I build room-1.", 12);
  assert.equal(accepted.narrativeResolution.success, true);
  assert.match(DMS.narrativeResolutionText(accepted.narrativeResolution), /SUCCESS[\s\S]*merely begun[\s\S]*do not depict it as complete/i);
  assert.equal(dms.tasks.length, 1);
  assert.equal(Object.values(dms.rooms).find(room => room.definition === "material-works").state, "Constructing");
});

test("later Administrator summoning is hidden and rejected until an active role exists", () => {
  const dms = tierOne(configured());
  assert.doesNotMatch(DMS.systemHelp(dms), /"Summoning"|summon an Administrator for an active function/);
  assert.throws(() => DMS.summonAdministrator(dms, "Kara", "Ashbound"), /No active non-Throne facility function/);
  assert.equal(dms.generation.administratorSequence, 1, "a rejected summon does not consume deterministic identity");
  DMS.createRoom(dms, "material-works");
  finishTasks(dms);
  assert.match(DMS.systemHelp(dms), /"Summoning"[\s\S]*summon an Administrator for an active function/);
  const second = DMS.summonAdministrator(dms, "Kara", "Ashbound");
  assert.notEqual(second.role, "Manager");
});

test("the context lifecycle gives the model the authoritative result of a prose action", () => {
  global.storyCards.length = 0;
  const dms = tierOne(configured());
  setStock(dms, 0);
  global.state = { DMS: dms };
  global.info = { actionCount: 21, maxChars: 12000 };
  global.text = "I build room-1.";
  global.stop = false;
  global.DungeonManagement("input");
  assert.equal(global.state.DMSNarrativeResolution.success, false);
  global.text = "Existing scenario context.";
  global.DungeonManagement("context");
  assert.match(global.text, /\[DMS AUTHORITATIVE ACTION RESULT\][\s\S]*NOT PERFORMED[\s\S]*No task began[\s\S]*Do not contradict/);
  global.text = "The Dungeon refuses the attempted construction.";
  global.DungeonManagement("output");
  assert.equal(global.state.DMSNarrativeResolution, undefined);
});
