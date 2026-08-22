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
    thronebound: "Mara", race: "Voidkin", className: "Ash Sovereign", name: "The Ashen Court",
    theme: "Volcanic necromancy", style: "Gothic basalt fortress",
    workerDescription: "masked ashbound skeletons", soldierDescription: "ember-wreathed revenants",
    homeworld: "Caelus", secondaryLocation: "The Crossroads"
  });
  DMS.defineResource(dms, "construction", ["Graveglass", "Black volcanic crystal shot through with soul-light.", "Quarried from cooling ossuary flows.", "Shapes rooms, fortifications, and dungeon infrastructure."]);
  DMS.defineResource(dms, "sustenance", ["Cinder Marrow", "Heat-rich spiritual biomass consumed by the ashbound.", "Rendered from fungal char gardens.", "Sustains Workers and Soldiers."]);
  DMS.defineResource(dms, "development", ["Sovereign Ichor", "Concentrated adaptive essence compatible with linked souls.", "Refined from voluntary resonance shed in the sanctum.", "Develops the Thronebound and Administrators."]);
  DMS.defineResource(dms, "energy", ["Pyreflow", "The dungeon's current of necromantic heat and command.", "Drawn through conduits from the throne's Lustrian bond.", "Primary currency for dungeon development."]);
  return dms;
}

function rich(dms, amount = 100000) {
  for (const role of DMS.RESOURCE_ROLES) dms.dungeon.resources[role].amount = amount;
  return dms;
}

function foundation(dms) {
  DMS.createRoom(dms, "material-works");
  DMS.createRoom(dms, "sustenance-works");
  DMS.createRoom(dms, "worker-habitat");
  return dms;
}

test("requires all four fully described theme resources", () => {
  const dms = DMS.defaultState();
  DMS.configure(dms, { theme: "Crystal hive", style: "Prismatic lattice", workerDescription: "shard drones", soldierDescription: "crystal wardens" });
  assert.equal(DMS.identityReady(dms), false);
  assert.equal(dms.initialized, false);
  const ready = configured();
  assert.equal(DMS.identityReady(ready), true);
  assert.equal(ready.initialized, true);
  assert.equal(ready.dungeon.resources.development.name, "Sovereign Ichor");
});

test("migrates the prototype tronebound spelling to canonical thronebound", () => {
  const dms = DMS.normalize({ schema: 1, tronebound: { name: "Legacy Name", level: 4 } });
  assert.equal(dms.thronebound.name, "Legacy Name");
  assert.equal(dms.thronebound.level, 4);
  assert.equal(Object.hasOwn(dms, "tronebound"), false);
});

test("creates a throne room without tracking map placement", () => {
  const dms = configured();
  assert.equal(dms.rooms["room-throne"].definition, "throne-room");
  assert.equal(Object.hasOwn(dms.rooms["room-throne"], "coordinates"), false);
  assert.match(dms.rooms["room-throne"].lore.appearance, /Volcanic necromancy/);
});

test("room functions are scripted while Appearance Function and Job are themed lore", () => {
  const dms = configured();
  const room = DMS.createRoom(dms, "material-works");
  assert.equal(room.definition, "material-works");
  assert.match(room.lore.appearance, /Gothic basalt fortress/);
  assert.match(room.lore.function, /Graveglass/);
  assert.match(room.lore.job, /Material Gatherer/);
  assert.match(room.lore.job, /masked ashbound skeletons/);
});

test("Dungeon Tier controls capacities room unlocks and room upgrade limits", () => {
  const dms = rich(foundation(configured()));
  DMS.createAdministrator(dms, { name: "Veyra", race: "Ashborn", className: "Court Steward", specialization: "support" });
  assert.throws(() => DMS.createRoom(dms, "barracks"), /unlocks at Dungeon Tier 2/);
  const result = DMS.upgradeDungeon(dms);
  assert.equal(result.tier, 2);
  assert.equal(dms.dungeon.administratorCapacity, 2);
  assert.ok(result.unlockedRooms.some(room => room.name === "Barracks"));
  const room = DMS.upgradeRoom(dms, "room-1");
  assert.equal(room.tier, 2);
  assert.throws(() => DMS.upgradeRoom(dms, "room-1"), /limited by Dungeon Tier 2/);
});

test("Administrator Capacity and attribute specialization follow Dungeon Tier", () => {
  const dms = configured();
  const admin = DMS.createAdministrator(dms, { name: "Veyra", race: "Ashborn", className: "Court Warden", specialization: "combat" });
  assert.deepEqual(Object.keys(admin.attributes), ["combat"]);
  assert.throws(() => DMS.createAdministrator(dms, { name: "Second", specialization: "support" }), /Capacity is 1/);
  assert.throws(() => DMS.createAdministrator(DMS.defaultState(), { name: "Invalid", specialization: "unique" }), /Combat or Support/);
});

test("Thronebound tracks Combat Support and theme-defined Unique Attributes", () => {
  const dms = configured();
  DMS.defineUniqueAttribute(dms, "Pyre Dominion", "Authority over the dungeon's necromantic heat.", 3);
  assert.ok(dms.thronebound.attributes.combat.Might);
  assert.ok(dms.thronebound.attributes.support.Command);
  assert.equal(dms.thronebound.attributes.unique["Pyre Dominion"].value, 3);
});

test("Class Tier is capped by Dungeon Tier and evolution grants exactly one Skill and Trait", () => {
  const dms = rich(configured());
  assert.throws(() => DMS.evolveClass(dms, "thronebound", "Ash Step", "Move through cinders.", "Pyre Heart", "Endure spiritual heat."), /requires Dungeon Tier 2/);
  foundation(dms);
  DMS.upgradeDungeon(dms);
  const evolved = DMS.evolveClass(dms, "thronebound", "Ash Step", "Move through cinders.", "Pyre Heart", "Endure spiritual heat.");
  assert.equal(evolved.class.tier, 2);
  assert.deepEqual(evolved.class.skills.map(skill => skill.name), ["Ash Step"]);
  assert.deepEqual(evolved.class.traits.map(trait => trait.name), ["Pyre Heart"]);
  DMS.buySkill(dms, "thronebound", "Graveglass Guard", "Raise a themed defensive plane.", 10);
  assert.equal(evolved.class.skills.length, 2);
});

test("Workers require capacity and assigned Workers drive production", () => {
  const dms = configured();
  const works = DMS.createRoom(dms, "material-works");
  assert.throws(() => DMS.recruitWorkers(dms, 1), /Worker Capacity/);
  DMS.createRoom(dms, "worker-habitat");
  DMS.recruitWorkers(dms, 2);
  DMS.assignWorkers(dms, works.id, 3);
  const before = dms.dungeon.resources.construction.amount;
  const report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, 9);
  assert.equal(dms.dungeon.resources.construction.amount, before + 9);
});

test("unique-worker rooms use one worker and scale primarily from Room Tier", () => {
  const dms = rich(foundation(configured()));
  DMS.upgradeDungeon(dms);
  const sanctum = DMS.createRoom(dms, "development-sanctum");
  DMS.assignWorkers(dms, sanctum.id, 4);
  assert.equal(sanctum.assignedWorkers, 1);
  DMS.upgradeRoom(dms, sanctum.id);
  assert.equal(dms.population.workers.assignments[sanctum.id].tier, 2);
  assert.equal(dms.population.workers.assignments[sanctum.id].job, "Development Attendant");
  const report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.development, 4);
});

test("Soldiers unlock through Barracks and contribute Tier-scaled Combat Power", () => {
  const dms = rich(foundation(configured()));
  DMS.upgradeDungeon(dms);
  const barracks = DMS.createRoom(dms, "barracks");
  const cohort = DMS.recruitSoldiers(dms, "Guardian", 3, barracks.id);
  assert.equal(cohort.tier, 1);
  assert.equal(dms.population.soldiers.capacity, 6);
  assert.equal(dms.population.soldiers.current, 3);
  assert.ok(dms.dungeon.power > 10);
});

test("Activity tracks major and optional secondary locations", () => {
  const dms = configured();
  DMS.setLocation(dms, "Homeworld", "Capital", "Northern district");
  assert.equal(dms.activity.location.major, "Homeworld");
  assert.equal(dms.activity.location.secondary, "Capital");
  DMS.setLocation(dms, "Secondary", "The Crossroads", "Market");
  assert.equal(dms.activity.location.major, "Secondary");
});

test("Dungeon System availability is restricted to the Throne Room", () => {
  const dms = configured();
  assert.equal(DMS.systemAvailable(dms), true);
  DMS.setLocation(dms, "Dungeon", "Material Works");
  assert.equal(DMS.systemAvailable(dms), false);
  DMS.setLocation(dms, "Lustria", "Frontier");
  assert.equal(DMS.systemAvailable(dms), false);
});

test("scouting Lustria deterministically discovers setting resources and threat gates exploitation", () => {
  function discover() {
    const dms = rich(foundation(configured()));
    DMS.upgradeDungeon(dms);
    DMS.createRoom(dms, "scout-lodge");
    DMS.setLocation(dms, "Lustria", "Western frontier");
    DMS.setActivity(dms, "Survey", [], "Standard");
    return { dms, sector: DMS.scoutSector(dms, "Glasswild Reach") };
  }
  const first = discover(), second = discover();
  assert.deepEqual(first.sector, second.sector);
  const vein = first.dms.world.lustria.veins[first.sector.veins[0]];
  assert.ok(DMS.LUSTRIAN_RESOURCES.some(resource => resource.key === vein.resourceKey));
  assert.ok(["Accessible", "Contested"].includes(first.sector.status));
  first.dms.population.soldiers.cohorts.push({ id: "test-army", archetype: "Guardian", count: 100, tier: 2 });
  const secured = DMS.secureSector(first.dms, first.sector.id);
  assert.equal(secured.status, "Secured");
});

test("higher-tier vein facilities target sites and extract by Room Tier and staffing", () => {
  const dms = rich(foundation(configured()));
  DMS.upgradeDungeon(dms);
  DMS.createRoom(dms, "scout-lodge");
  DMS.createRoom(dms, "barracks");
  DMS.recruitSoldiers(dms, "Specialist", 6);
  rich(dms);
  DMS.upgradeDungeon(dms);
  const extractor = DMS.createRoom(dms, "vein-extractor");
  DMS.createRoom(dms, "worker-habitat");
  DMS.assignWorkers(dms, extractor.id, 2);
  DMS.setLocation(dms, "Lustria", "Frontier");
  DMS.setActivity(dms, "Survey", [], "Standard");
  const sector = DMS.scoutSector(dms, "Crownless Expanse");
  dms.dungeon.power = 10000;
  const vein = DMS.targetVein(dms, extractor.id, sector.veins[0]);
  const before = vein.remaining;
  const report = DMS.resolveCycle(dms);
  assert.equal(before - vein.remaining, 4);
  assert.equal(Object.values(report.lustriaResources)[0], 4);
  DMS.upgradeRoom(dms, extractor.id);
  assert.equal(extractor.tier, 2);
});

test("global Lustria lore excludes story-specific names and Eryndral", () => {
  global.storyCards.length = 0;
  const dms = configured();
  DMS.refreshCards(dms);
  const card = global.storyCards.find(item => item.title === "Lore — Nexus Realm of Lustria");
  assert.ok(card);
  assert.match(card.entry, /Architect/);
  assert.match(card.entry, /Dominion of Lustria/);
  assert.doesNotMatch(card.entry, /Eryndral|Fate Veylark|Velis Reverie|Orphan/i);
  assert.ok(global.storyCards.some(item => item.title === "DMS — Activity"));
  assert.ok(global.storyCards.some(item => item.type === "Active Quests"));
});

test("managed commands preserve the monolithic AI Dungeon command lifecycle", () => {
  const dms = configured();
  const output = DMS.execute(dms, "/dms status");
  assert.match(output, /Thronebound: Mara/);
  assert.match(DMS.execute(dms, "/dms room list"), /vein-extractor/);
});

test("Input Context and Output hooks route slash commands without story generation", () => {
  global.state.DMS = configured();
  global.text = "/dms status";
  global.DungeonManagement("input");
  assert.equal(global.state.DMSCommandTurn, true);
  global.text = "irrelevant model output";
  global.DungeonManagement("output");
  assert.match(global.text, /DUNGEON MANAGEMENT SYSTEM/);
  assert.match(global.text, /Thronebound: Mara/);
  assert.equal(global.state.DMSCommandTurn, false);
});
