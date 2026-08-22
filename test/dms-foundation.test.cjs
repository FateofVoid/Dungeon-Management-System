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
  DMS.configure(dms, { thronebound: "Mara", race: "Voidkin", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic basalt fortress", workerDescription: "masked ashbound skeletons", soldierDescription: "ember-wreathed revenants", homeworld: "Caelus", secondaryLocation: "The Crossroads" });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal shot through with soul-light.", "Quarried from cooling ossuary flows.", "Shapes rooms and fortifications."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass.", "Rendered from fungal char gardens.", "Sustains the dungeon population."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence.", "Refined from resonance.", "Develops linked characters."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic heat and command.", "Drawn through the throne.", "Primary dungeon currency."]);
  return dms;
}

function rich(dms, amount = 100000) { for (const role of DMS.RESOURCE_ROLES) dms.dungeon.resources[role].amount = amount; return dms; }
function systemMode(dms) { DMS.setLocation(dms, "Dungeon", "Throne Room"); DMS.setActivity(dms, "System", [], "Timeless"); return dms; }
function finishTasks(dms) { let guard = 100; while (dms.tasks.length && guard-- > 0) DMS.resolveCycle(dms); assert.ok(guard > 0); }

test("resource transactions are atomic and report exact deltas", () => {
  const dms = configured();
  const before = dms.dungeon.resources.energy.amount;
  assert.throws(() => DMS.spend(dms, { energy: before + 1 }), /Requires/);
  assert.equal(dms.dungeon.resources.energy.amount, before);
  const changes = DMS.rewardResources(dms, { energy: 7 }, "test-reward");
  assert.deepEqual(changes.energy, { before, delta: 7, after: before + 7 });
  assert.equal(dms.resourceTransactions.at(-1).context, "test-reward");
});

test("compact save cards restore newer mechanical state without recreating cards", () => {
  global.storyCards.length = 0;
  const dms = rich(systemMode(configured()));
  DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  DMS.upgradeDungeon(dms);
  const room = DMS.createRoom(dms, "material-works");
  finishTasks(dms);
  DMS.refreshCards(dms);

  const saveRevision = dms.persistence.revision;
  const cardCount = global.storyCards.length;
  const saveCards = global.storyCards.filter(card => card.title.startsWith("DMS Save — "));
  assert.equal(saveCards.length, 4);
  assert.ok(saveCards.every(card => JSON.parse(card.entry).rev === saveRevision));
  assert.ok(saveCards.every(card => !/Appearance:|Class Description:/.test(card.entry)));

  const stale = configured();
  stale.persistence.cacheRevision = 0;
  const restored = DMS.loadSaveCards(stale);
  assert.equal(restored.persistence.revision, saveRevision);
  assert.equal(restored.dungeon.tier, 1);
  assert.equal(restored.rooms[room.id].state, "Active");
  assert.equal(restored.rooms[room.id].definition, "material-works");
  assert.equal(global.storyCards.length, cardCount, "manual load must not recreate Story Cards");
});

test("refresh removes duplicate managed save cards", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  const core = global.storyCards.find(card => card.title === DMS.SAVE_CARD_TITLES.core);
  global.storyCards.push({ ...core });
  assert.equal(global.storyCards.filter(card => card.title === DMS.SAVE_CARD_TITLES.core).length, 2);
  DMS.refreshCards(dms);
  assert.equal(global.storyCards.filter(card => card.title === DMS.SAVE_CARD_TITLES.core).length, 1);
});

test("Activity retry protection prevents duplicate natural production rewards", () => {
  const dms = configured();
  DMS.setActivity(dms, "Production", [], "Standard");
  const before = dms.dungeon.resources.energy.amount;
  const first = DMS.applyActivityTurn(dms, "I help produce energy", 42);
  const second = DMS.applyActivityTurn(dms, "I help produce energy", 42);
  assert.equal(first.repeated, undefined);
  assert.equal(second.repeated, true);
  assert.equal(dms.dungeon.resources.energy.amount, before + 1);
});

test("inactive facilities never provide their mechanical room effects", () => {
  const dms = rich(configured());
  dms.dungeon.tier = 2;
  DMS.applyDerivedState(dms);
  const hall = DMS.createRoom(dms, "attribute-training-hall");
  assert.equal(hall.state, "Constructing");
  assert.throws(() => DMS.trainAttribute(dms, "Might", 5), /active Attribute Training Hall/);
  finishTasks(dms);
  assert.doesNotThrow(() => DMS.trainAttribute(dms, "Might", 5));
});

test("recognized natural System requests delegate to the authoritative command operation", () => {
  const dms = systemMode(configured());
  const result = DMS.applyActivityTurn(dms, "System: status", 99);
  assert.match(result.system, /Dungeon: The Ashen Court/);
  const repeated = DMS.applyActivityTurn(dms, "System: status", 99);
  assert.equal(repeated.repeated, true);
});
