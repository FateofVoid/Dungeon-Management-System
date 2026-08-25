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
  DMS.configure(dms, { thronebound: "Mara", race: "Voidkin", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic basalt fortress", populationNature: "Ashbound undead", populationAppearance: "Masked skeletons veined with ember light.", homeworld: "Caelus", homeworldDescription: "A storm-wrapped world of floating basalt kingdoms.", homeworldAnchor: "Mara's obsidian estate", growthPreferences: ["Might", "Endurance", "Command", "Logistics", "Insight"] });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal.", "Quarried from ossuary flows.", "Builds facilities."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass.", "Rendered from char gardens.", "Sustains cohorts."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence.", "Refined from resonance.", "Develops linked characters."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "Necromantic command energy.", "Drawn through the throne.", "Primary dungeon currency."]);
  DMS.confirmAptitudes(dms);
  return dms;
}

function rich(dms, amount = 100000) { for (const role of DMS.RESOURCE_ROLES) dms.dungeon.resources[role].amount = amount; return dms; }
function finishTasks(dms) { let guard = 200; while (dms.tasks.length && guard-- > 0) DMS.resolveCycle(dms); assert.ok(guard > 0); }
function systemMode(dms) { DMS.setLocation(dms, "Dungeon", "Throne Room"); DMS.setActivity(dms, "System", [], "Timeless"); return dms; }
function activateRoom(dms, key, tier) { dms.dungeon.tier = tier; DMS.applyDerivedState(dms); const room = DMS.createRoom(dms, key); finishTasks(dms); while (room.tier < tier) { DMS.upgradeRoom(dms, room.id); finishTasks(dms); } return room; }

test("facility definitions use only lifecycle fields with authoritative consumers", () => {
  const schema = new Set(["name", "unlockTier", "kind", "function", "job", "baseCost", "uniqueWorker", "jobs", "resource", "baseProduction", "administratorRoles", "upkeepReduction", "workerHousing", "housingUpkeepDiscount", "housingEfficiencyBonus", "recoveryRate", "administratorSuites", "privateCapacity", "detainmentSlots", "bondGainBonus", "soldierJobs", "combatMultiplier", "productivityMultiplier", "scoutPower", "defenseMultiplier", "veinTargets", "extraction", "equipmentTier", "researchRequired", "storageMultiplier", "portalRoutes", "skillDiscount", "masteryGate"]);
  for (const [key, definition] of Object.entries(DMS.ROOM_DEFINITIONS)) {
    for (const required of ["name", "unlockTier", "kind", "function", "job", "baseCost"]) assert.ok(Object.hasOwn(definition, required), `${key} lacks ${required}`);
    for (const property of Object.keys(definition)) assert.ok(schema.has(property), `${key}.${property} has no registered lifecycle consumer`);
  }
});

test("graded dungeon resources keep lower Grades and leave Energy and Marks ungraded", () => {
  const dms = rich(configured(), 1000);
  const room = activateRoom(dms, "material-works", 4);
  const beforeBasic = dms.dungeon.resources.construction.grades.Basic, initialIntermediate = dms.dungeon.resources.construction.grades.Intermediate;
  DMS.refineResource(dms, "construction", 10, "Intermediate");
  assert.equal(dms.dungeon.resources.construction.grades.Basic, beforeBasic - 10);
  assert.equal(dms.dungeon.resources.construction.grades.Intermediate, initialIntermediate + 10);
  const beforeIntermediate = dms.dungeon.resources.construction.grades.Intermediate;
  DMS.resolveCycle(dms);
  assert.ok(dms.dungeon.resources.construction.grades.Intermediate > beforeIntermediate, "Tier 4 production should create Intermediate material");
  assert.equal(room.tier, 4);
  assert.equal(dms.dungeon.resources.energy.graded, false);
  assert.equal(dms.dungeon.resources.energy.grades, undefined);
  assert.deepEqual(DMS.transactMarks(dms, 25, "test-marks"), { before: 0, delta: 25, after: 25 });
  assert.throws(() => DMS.transactMarks(dms, -26), /Requires 26 Lustrian Marks/);
  global.storyCards.length = 0; DMS.refreshCards(dms); const loaded = DMS.loadSaveCards(configured());
  assert.equal(loaded.currencies.marks, 25);
  assert.equal(loaded.dungeon.resources.construction.grades.Intermediate, dms.dungeon.resources.construction.grades.Intermediate);
});

test("Lustrian site Grade gates targeting and extraction capability", () => {
  const dms = rich(configured(), 2000), extractor = activateRoom(dms, "vein-extractor", 3);
  dms.world.lustria.sectors["sector-test"] = { id: "sector-test", name: "Test Reach", threat: 1, status: "Accessible", veins: ["vein-test"] };
  dms.world.lustria.veins["vein-test"] = { id: "vein-test", sectorId: "sector-test", resourceKey: "resonance-crystal", name: "Resonance Crystal Site", grade: "Intermediate", richness: 2, remaining: 20, status: "Discovered" };
  assert.throws(() => DMS.targetVein(dms, extractor.id, "vein-test"), /Tier 4 extraction facility/);
  dms.dungeon.tier = 4; DMS.applyDerivedState(dms); DMS.upgradeRoom(dms, extractor.id); finishTasks(dms);
  DMS.targetVein(dms, extractor.id, "vein-test"); DMS.resolveCycle(dms);
  assert.ok(dms.world.lustria.inventoryGrades["Resonance Crystals"].Intermediate > 0);
  assert.ok(dms.world.lustria.veins["vein-test"].remaining < 20);
});

test("task reservations deduct, persist, commit, and return exactly on cancellation", () => {
  const dms = rich(configured()); dms.dungeon.tier = 1; DMS.applyDerivedState(dms); DMS.updateQuests(dms);
  const beforeConstruction = dms.dungeon.resources.construction.amount, beforeEnergy = dms.dungeon.resources.energy.amount;
  const room = DMS.createRoom(dms, "material-works"), task = dms.tasks[0];
  assert.ok(task.reservationId && dms.reservations[task.reservationId]);
  assert.ok(dms.dungeon.resources.construction.amount < beforeConstruction);
  global.storyCards.length = 0; DMS.refreshCards(dms);
  assert.ok(DMS.readSaveCards().operations.reservations[task.reservationId], "active reservations must survive the compact save");
  DMS.cancelTask(dms, task.id);
  assert.equal(dms.rooms[room.id], undefined);
  assert.equal(dms.dungeon.resources.construction.amount, beforeConstruction);
  assert.equal(dms.dungeon.resources.energy.amount, beforeEnergy);
  assert.equal(Object.keys(dms.reservations).length, 0);

  DMS.createRoom(dms, "material-works"); finishTasks(dms);
  assert.equal(Object.keys(dms.reservations).length, 0, "completion commits rather than refunds the reservation");
});

test("save cards are subsystem-aware, chunk safely, migrate schema 1, and reject stale cache writes", () => {
  global.storyCards.length = 0;
  const dms = configured(); DMS.refreshCards(dms);
  let saveCards = global.storyCards.filter(card => card.title.startsWith("DMS Save — "));
  assert.ok(saveCards.every(card => card.entry.length <= DMS.SAVE_CARD_MAX));
  assert.equal(saveCards.some(card => card.title === DMS.SAVE_CARD_TITLES.world), false, "unused world subsystem should not create a save card");
  dms.dungeon.tier = 2; DMS.applyDerivedState(dms); DMS.setLocation(dms, "Homeworld", "Caelus"); DMS.refreshCards(dms);
  assert.ok(global.storyCards.some(card => card.title === DMS.SAVE_CARD_TITLES.world));
  const core = global.storyCards.find(card => card.title === DMS.SAVE_CARD_TITLES.core), newerEntry = core.entry, newerRevision = DMS.readSaveCards().revision;
  dms.persistence.revision = newerRevision - 1;
  assert.equal(DMS.writeSaveCards(dms), false);
  assert.equal(core.entry, newerEntry);

  global.storyCards.length = 0;
  const revision = 7;
  const legacy = {
    core: { sv: 1, rev: revision, schema: 4, tier: 0, cycle: 2, progress: 0, res: { construction: 20, sustenance: 30, development: 40, energy: 50 }, gen: {} },
    progression: { sv: 1, rev: revision, tb: {}, admins: {}, quests: {} },
    operations: { sv: 1, rev: revision, rooms: {}, tasks: [], soldiers: [], research: {} },
    world: { sv: 1, rev: revision, lustria: { sectors: {}, veins: {}, inventory: {}, controlledSectors: [] } }
  };
  for (const [key, value] of Object.entries(legacy)) global.storyCards.push({ title: DMS.SAVE_CARD_TITLES[key], keys: `LEGACY_${key}`, entry: JSON.stringify(value) });
  const snapshot = DMS.readSaveCards();
  assert.equal(snapshot.core.sv, DMS.SAVE_SCHEMA);
  assert.equal(snapshot.core.migratedFrom, 1);
  const loaded = DMS.loadSaveCards(DMS.defaultState(), snapshot);
  assert.equal(loaded.persistence.revision, revision);
  assert.equal(loaded.dungeon.resources.construction.grades.Basic, 20);
  assert.equal(loaded.dungeon.resources.energy.amount, 50);
});

test("save-card character limits are asserted after every authoritative save", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  const report = DMS.assertSaveCardCharacterLimits();
  assert.ok(report.count >= 2);
  assert.ok(report.maximum <= DMS.SAVE_CARD_MAX);
  assert.equal(report.limit, 1800);
  const oversized = [{ title: `${DMS.SAVE_CARD_TITLES.core} Oversized`, entry: "x".repeat(DMS.SAVE_CARD_MAX + 1) }];
  assert.throws(() => DMS.assertSaveCardCharacterLimits(oversized), /exceeds the 1800-character save-card boundary/);
});

test("save cards update through AI Dungeon's key-based Story Card API without relying on titles", () => {
  global.storyCards.length = 0;
  const backingCards = [];
  global.addStoryCard = (keys, entry, type) => { backingCards.push({ id: String(backingCards.length + 1), keys, entry, type }); };
  global.updateStoryCard = (index, keys, entry, type) => { backingCards[index] = { id: backingCards[index].id, keys, entry, type }; };
  global.removeStoryCard = index => { backingCards.splice(index, 1); };
  try {
    const dms = configured();
    DMS.refreshCards(dms);
    DMS.execute(dms, "/dms status");
    DMS.execute(dms, "/dms resources");
    DMS.writeSaveCards(dms);
    const snapshot = DMS.readSaveCards();
    assert.equal(snapshot.revision, dms.persistence.revision);
    assert.equal(snapshot.core.onboarding[0], 1);
    assert.equal(snapshot.core.onboarding[1], 1);
    assert.equal(global.storyCards.filter(card => card.keys === "DMS_SAVE_CORE_1").length, 1);
    assert.equal(backingCards.filter(card => card.keys === "DMS_SAVE_CORE_1").length, 1);
    assert.equal(backingCards.find(card => card.keys === "DMS_SAVE_CORE_1").entry, global.storyCards.find(card => card.keys === "DMS_SAVE_CORE_1").entry);
    assert.ok(global.storyCards.every(card => !Object.hasOwn(card, "title")), "the test adapter mirrors the live API, which exposes no card title field");
    const cardCount = backingCards.length;
    global.storyCards.splice(0, global.storyCards.length, ...global.storyCards.filter(card => String(card.keys).startsWith("DMS_SAVE_")));
    DMS.refreshCards(dms);
    assert.equal(backingCards.length, cardCount, "managed cards must not be recreated when AI Dungeon omits them from the next runtime snapshot");
    const restored = DMS.loadSaveCards(undefined, snapshot);
    assert.equal(restored.thronebound.name, dms.thronebound.name);
    assert.equal(restored.thronebound.race, dms.thronebound.race);
    assert.equal(restored.dungeon.name, dms.dungeon.name);
    assert.equal(restored.dungeon.theme, dms.dungeon.theme);
    assert.equal(restored.dungeon.style, dms.dungeon.style);
    assert.equal(restored.dungeon.resources.construction.name, dms.dungeon.resources.construction.name);
    assert.deepEqual(restored.generation.managedCardKeys, dms.generation.managedCardKeys);
    assert.deepEqual(DMS.dungeonSignature(restored), DMS.dungeonSignature(dms));
  } finally {
    delete global.addStoryCard;
    delete global.updateStoryCard;
    delete global.removeStoryCard;
  }
});

test("live Story Card lifecycle uses hidden reserves and reveals unlocks by replacement", () => {
  global.storyCards.length = 0;
  for (let index = 1; index <= 32; index++) global.storyCards.push({ id: `reserve-${index}`, keys: `DMS_SAVE_RESERVE_${index}`, entry: "Reserved hidden DMS save-card slot.", type: "System — DMS Reserve", showInStoryCards: false, isSpoiler: false });
  const facilityKey = "DMS_FACILITY_UNLOCK_MATERIAL_WORKS";
  global.storyCards.push({ id: "locked-material", keys: facilityKey, entry: "Material Works", type: "System — Locked Facilities", showInStoryCards: false, isSpoiler: true });
  const addedKeys = [];
  global.addStoryCard = (keys, entry, type) => { addedKeys.push(keys); global.storyCards.push({ id: `added-${addedKeys.length}`, keys, entry, type }); };
  global.updateStoryCard = (index, keys, entry, type) => Object.assign(global.storyCards[index], { keys, entry, type });
  global.removeStoryCard = index => { global.storyCards.splice(index, 1); };
  try {
    const dms = configured();
    DMS.refreshCards(dms);
    assert.equal(global.storyCards.find(card => card.keys === facilityKey)?.showInStoryCards, false, "a locked imported card remains hidden and untouched");
    assert.equal(addedKeys.filter(key => key.startsWith("DMS_SAVE_")).length, 0, "save chunks claim imported hidden reserves instead of creating visible cards");
    assert.ok(global.storyCards.some(card => card.keys.startsWith("DMS_SAVE_CORE_")));
    assert.ok(global.storyCards.filter(card => card.keys.startsWith("DMS_SAVE_") && !card.keys.startsWith("DMS_SAVE_RESERVE_")).every(card => card.showInStoryCards === false));

    dms.dungeon.tier = 1;
    DMS.refreshCards(dms);
    const materialCards = global.storyCards.filter(card => card.keys === facilityKey);
    assert.equal(materialCards.length, 1);
    assert.equal(materialCards[0].showInStoryCards, true, "the replacement uses AI Dungeon's default visible presentation");
    assert.equal(materialCards[0].isSpoiler, false);
    assert.equal(dms.generation.revealedCardKeys.includes(facilityKey), true);
  } finally {
    delete global.addStoryCard;
    delete global.updateStoryCard;
    delete global.removeStoryCard;
  }
});

test("Story awakening and independent tutorial chains advance through authoritative play", () => {
  const dms = rich(systemMode(configured()));
  DMS.execute(dms, "/dms status");
  DMS.execute(dms, "/dms resources");
  assert.equal(dms.quests.records["story-awakening-1"].status, "active");
  assert.equal(dms.quests.records["tutorial-system-manager"].status, "active");
  DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  assert.equal(dms.quests.records["story-awakening-1"].status, "active", "Story Awakening remains broad and does not duplicate the Manager lesson");
  DMS.execute(dms, "/dms tier requirements");
  DMS.upgradeDungeon(dms);
  assert.equal(dms.quests.records["story-awakening-1"].status, "cleared");
  assert.equal(dms.quests.records["tutorial-system-tier-up"].status, "cleared");
  assert.equal(dms.quests.records["story-first-contact-1"].status, "active");
  assert.equal(dms.quests.records["thronebound-class-requirements"].status, "active");
  assert.equal(dms.quests.records["tier1-main-construction"].status, "active", "independent mechanical chains may be active together");
  assert.equal(dms.quests.records["tier1-main-sustenance"].status, "active");
});

test("natural System requests delegate queries and common management actions to execute", () => {
  const dms = rich(systemMode(configured()));
  const query = DMS.applyActivityTurn(dms, "System: show resources", 101);
  assert.ok(query.system.startsWith(DMS.execute(dms, "/dms resources")));
  DMS.summonAdministrator(dms); DMS.upgradeDungeon(dms);
  const action = DMS.applyActivityTurn(dms, "System: build material-works", 102);
  const roomName = Object.values(dms.rooms).find(room => room.definition === "material-works").name;
  assert.match(action.system, new RegExp(`Began construction of ${roomName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.equal(dms.tasks.filter(task => task.type === "build-room").length, 1);
  const retry = DMS.applyActivityTurn(dms, "System: build material-works", 102);
  assert.equal(retry.repeated, true);
});

test("natural authoritative changes are saved during the input hook before output", () => {
  global.storyCards.length = 0;
  const dms = configured(); DMS.setActivity(dms, "Production", [], "Standard"); DMS.refreshCards(dms);
  global.state = { DMS: dms }; global.info = { actionCount: 909, maxChars: 12000 }; global.text = "I help produce energy through the conduit.";
  const before = dms.dungeon.resources.energy.amount;
  global.DungeonManagement("input");
  assert.equal(global.state.DMS.dungeon.resources.energy.amount, before + 1);
  assert.equal(DMS.readSaveCards().revision, global.state.DMS.persistence.revision);
  assert.equal(DMS.readSaveCards().core.res.energy, before + 1);
});

test("Forge options are deterministic and crafted equipment becomes persistent mechanical state", () => {
  global.storyCards.length = 0;
  const dms = rich(configured()), forge = activateRoom(dms, "forge", 3);
  const first = DMS.generateEquipmentOptions(dms, "Thronebound"), second = DMS.generateEquipmentOptions(dms, "Thronebound");
  assert.deepEqual(second, first);
  const task = DMS.craftEquipment(dms, first[0].id, "thronebound");
  finishTasks(dms);
  assert.equal(dms.equipment.items[task.itemId].assignedTo, "thronebound");
  assert.equal(forge.state, "Active");
  DMS.refreshCards(dms);
  const loaded = DMS.loadSaveCards(configured());
  assert.equal(loaded.equipment.items[task.itemId].name, first[0].name);
});

test("Portal Gate properties establish persistent route capacity and legal travel", () => {
  const dms = rich(configured()); dms.dungeon.tier = 5; DMS.applyDerivedState(dms);
  DMS.setLocation(dms, "Homeworld", "Caelus", "Ash Coast");
  const anchor = Object.values(dms.portals.anchors)[0];
  DMS.setLocation(dms, "Dungeon", "Throne Room");
  activateRoom(dms, "portal-gate", 5);
  const route = DMS.openPortalRoute(dms, anchor.id);
  assert.ok(DMS.portalRouteLimit(dms) >= 1);
  DMS.travelPortalRoute(dms, route.id);
  assert.equal(dms.activity.location.major, "Homeworld");
  assert.equal(dms.activity.location.detail, "Ash Coast");
  DMS.closePortalRoute(dms, route.id);
  assert.throws(() => DMS.travelPortalRoute(dms, route.id), /Unknown active portal route/);
});
