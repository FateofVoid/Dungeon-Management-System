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

function systemMode(dms) {
  DMS.setLocation(dms, "Dungeon", "Throne Room");
  DMS.setActivity(dms, "System", [], "Timeless");
  return dms;
}

function awakenTier1() {
  const dms = systemMode(configured());
  DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  DMS.tierRequirementsStatus(dms, true);
  DMS.upgradeDungeon(dms);
  return dms;
}

function finishTasks(dms) {
  let guard = 100;
  while (dms.tasks.length && guard-- > 0) DMS.resolveCycle(dms);
  assert.ok(guard > 0, "Tier 1 task should finish within the guard");
}

function build(dms, definition) {
  const room = DMS.createRoom(dms, definition);
  finishTasks(dms);
  return room;
}

test("Tier 1 production consumes active jobs, housing, Expansion, Tier, Rank, and global effects", () => {
  const dms = awakenTier1(), material = build(dms, "material-works");
  let report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, Number((4 * 3 * DMS.dungeonAttributeMultiplier(dms, "Production") * 0.9).toFixed(2)), "four unhoused Workers operate at the modest 0.9 penalty");
  const habitat = build(dms, "worker-habitat");
  report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, Number((4 * 3 * DMS.dungeonAttributeMultiplier(dms, "Production")).toFixed(2)), "proper housing restores normal Worker efficiency");
  const upkeepWithHousing = report.upkeep;
  habitat.state = "Inactive";
  report = DMS.resolveCycle(dms);
  assert.ok(report.upkeep > upkeepWithHousing, "inactive housing stops reducing Worker Sustenance burden");
  habitat.state = "Active";
  DMS.expandRoom(dms, material.id); finishTasks(dms);
  assert.equal(dms.population.workers.cohorts.find(cohort => cohort.workRoomId === material.id).count, 8);
  const manager = Object.values(dms.administrators)[0]; DMS.assignAdministrator(dms, manager.id, material.id);
  report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, Number((8 * 3 * DMS.dungeonAttributeMultiplier(dms, "Production") * DMS.administratorAssignmentEffectiveness(dms, manager)).toFixed(2)));
  material.state = "Inactive";
  report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction || 0, 0, "inactive production facilities produce nothing");
});

test("Worker residences recover disruption and private residences support named characters without individual Worker records", () => {
  global.storyCards.length = 0;
  const dms = awakenTier1(), material = build(dms, "material-works");
  for (let index = 0; index < 10; index++) DMS.resolveCycle(dms);
  const habitat = build(dms, "worker-habitat"), quarters = build(dms, "administrator-quarters"), chamber = build(dms, "thronebound-private-chamber");
  const cohort = dms.population.workers.cohorts.find(value => value.workRoomId === material.id);
  DMS.disruptWorkerCohort(dms, cohort.id, 35);
  DMS.resolveCycle(dms);
  assert.equal(dms.population.workers.cohorts.find(value => value.id === cohort.id).disruption, 25);
  const second = DMS.summonAdministrator(dms, "Kara", "Ashborn");
  const beforeShared = second.bond.value; DMS.addAdministratorBond(dms, second.id, 1);
  assert.equal(second.bond.value - beforeShared, 0.9, "shared quarters carry a minor Bond-gain penalty");
  DMS.assignResidence(dms, second.id, quarters.id);
  const beforePrivate = second.bond.value; DMS.addAdministratorBond(dms, second.id, 1);
  assert.equal(Number((second.bond.value - beforePrivate).toFixed(2)), 1.1);
  const named = DMS.nameResidence(dms, second.id, "Kara's Cinder Suite", "Ember gardens", "Bond");
  assert.equal(named.bonus, "Bond");
  DMS.assignPrivateStay(dms, second.id, chamber.id);
  DMS.assignDetainment(dms, "Captured infiltrator", chamber.id);
  const manager = Object.values(dms.administrators).find(admin => admin.role === "Manager");
  DMS.assignResidence(dms, manager.id, quarters.id);
  DMS.nameResidence(dms, manager.id, "Veyra's Ash Office", "Cinder ledgers", "Efficiency");
  DMS.assignAdministrator(dms, manager.id, material.id);
  const disruptedEfficiency = DMS.workerEfficiency(dms, material.id);
  const report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, Number((4 * 3 * DMS.dungeonAttributeMultiplier(dms, "Production") * DMS.administratorAssignmentEffectiveness(dms, manager) * disruptedEfficiency).toFixed(2)), "Efficiency residences and Dungeon Attributes affect the Administrator's authoritative assignment result");
  DMS.refreshCards(dms);
  assert.ok(global.storyCards.some(card => card.title === "DMS Named Residence — Kara's Cinder Suite"));
  assert.match(DMS.residenceStatus(dms), /Kara's Cinder Suite/);
  assert.equal(dms.population.workers.cohorts.some(value => Object.hasOwn(value, "members")), false, "Workers remain cohorts rather than individual records");
  assert.equal(habitat.state, "Active");
});

test("Class lineage and fixed-price shops reject duplicate purchases atomically", () => {
  const dms = awakenTier1();
  assert.match(DMS.execute(dms, "/dms class previews thronebound"), /Option 1:/);
  DMS.acceptClassPreview(dms, "thronebound", 2);
  assert.equal(dms.thronebound.class.lineage.length, 1);
  assert.equal(dms.thronebound.class.lineage[0].className, dms.thronebound.class.name);
  const hall = build(dms, "general-skill-hall");
  const purchased = DMS.buyShopEntry(dms, "thronebound", "skill", 1, 1);
  const development = dms.dungeon.resources.development.amount, energy = dms.dungeon.resources.energy.amount;
  assert.throws(() => DMS.buyShopEntry(dms, "thronebound", "skill", 1, 1), /Duplicate Skill/);
  assert.equal(dms.dungeon.resources.development.amount, development);
  assert.equal(dms.dungeon.resources.energy.amount, energy);
  assert.throws(() => DMS.buySkill(dms, "thronebound", "Custom Price", "", 1), /Direct player-priced ability purchasing is disabled/);
  assert.ok(dms.thronebound.class.skills.some(skill => skill.name === purchased.name));
  assert.equal(hall.state, "Active");
});

test("spoken Tier 1 operations and Bond scenes advance immersive tutorials without slash commands", () => {
  const dms = awakenTier1();
  let result = DMS.applyActivityTurn(dms, '> You say, "System, construct Material Works."', 1);
  assert.match(result.system, /Began construction of Material Works/);
  result = DMS.applyActivityTurn(dms, '> You say, "System, begin Construction Activity for Material Works."', 2);
  assert.match(result.system, /Activity: Construction/);
  for (let action = 3; action <= 5; action++) DMS.applyActivityTurn(dms, "> You help shape and construct the Material Works.", action);
  assert.equal(Object.values(dms.rooms).find(room => room.definition === "material-works").state, "Active");
  DMS.applyActivityTurn(dms, '> You say, "System, enter management mode."', 6);
  result = DMS.applyActivityTurn(dms, '> You say, "System, summon Administrator Kara|Ashborn."', 7);
  assert.match(result.system, /Summoned Kara/);
  result = DMS.applyActivityTurn(dms, '> You say, "System, assign Kara to Material Works."', 8);
  assert.match(result.system, /assigned to Material Works/);
  result = DMS.applyActivityTurn(dms, '> You say, "System, begin Bond Activity with Kara."', 9);
  assert.match(result.system, /Bond Activity begun/);
  for (let action = 10; action <= 12; action++) DMS.applyActivityTurn(dms, "> You spend time talking, listening, and sharing stories with Kara.", action);
  const kara = Object.values(dms.administrators).find(admin => admin.name === "Kara");
  assert.equal(kara.bond.value, 5);
  result = DMS.applyActivityTurn(dms, "> You confide in Kara and together resolve what the first bond means.", 13);
  assert.match(result.note, /Bond Event was completed/);
  assert.ok(kara.bond.completedEvents.includes(5));
});

test("Tier 1 persistence restores lineage, previews, residences, Worker disruption, milestones, and save limits", () => {
  global.storyCards.length = 0;
  const dms = awakenTier1(), material = build(dms, "material-works"), habitat = build(dms, "worker-habitat"), quarters = build(dms, "administrator-quarters");
  DMS.acceptClassPreview(dms, "thronebound", 1);
  const second = DMS.summonAdministrator(dms, "Kara", "Ashborn");
  DMS.assignResidence(dms, second.id, quarters.id);
  DMS.nameResidence(dms, second.id, "Kara's Cinder Suite", "Ember gardens", "Efficiency");
  const cohort = dms.population.workers.cohorts.find(value => value.workRoomId === material.id);
  DMS.disruptWorkerCohort(dms, cohort.id, 35);
  DMS.productionStatus(dms, true);
  DMS.refreshCards(dms);
  const limit = DMS.assertSaveCardCharacterLimits();
  assert.ok(limit.maximum <= DMS.SAVE_CARD_MAX);
  assert.ok(global.storyCards.every(card => String(card.entry || "").length <= 2000), "Tier 1 generated cards remain within the conservative Story Card boundary");
  const loaded = DMS.loadSaveCards(DMS.defaultState());
  assert.deepEqual(loaded.thronebound.class.lineage, dms.thronebound.class.lineage);
  assert.deepEqual(loaded.classPreviews[second.id], dms.classPreviews[second.id]);
  assert.equal(loaded.residences.named[second.id].name, "Kara's Cinder Suite");
  assert.equal(loaded.population.workers.cohorts.find(value => value.id === cohort.id).disruption, 35);
  assert.equal(loaded.milestones.tier1.productionObserved, true);
  assert.equal(habitat.state, "Active");
});

test("a non-injected Tier 1 economy can legitimately fund the sealed Tier 2 threshold", () => {
  const dms = awakenTier1();
  const material = build(dms, "material-works");
  for (let index = 0; index < 4; index++) DMS.resolveCycle(dms);
  build(dms, "sustenance-works");
  build(dms, "worker-habitat");
  build(dms, "development-sanctum");
  build(dms, "energy-conduit");
  const habitat = Object.values(dms.rooms).find(room => room.definition === "worker-habitat");
  DMS.expandRoom(dms, habitat.id); finishTasks(dms);
  DMS.facilityTierStatus(dms, true);
  const manager = Object.values(dms.administrators)[0]; DMS.assignAdministrator(dms, manager.id, material.id);
  DMS.resolveCycle(dms);
  DMS.acceptClassPreview(dms, "thronebound", 1);
  DMS.summonAdministrator(dms, "Kara", "Ashborn");
  DMS.summonAdministrator(dms, "Seren", "Ashborn");
  let guard = 150;
  while (dms.quests.records["tier1-main-reserve"].status !== "cleared" && guard-- > 0) DMS.resolveCycle(dms);
  assert.ok(guard > 0, "ordinary Tier 1 production should fund the Tier 2 reserve");
  assert.equal(dms.quests.records["tier1-main-reserve"].status, "cleared");
  assert.equal(dms.quests.records["main-dungeon-tier-1"].status, "cleared");
  assert.throws(() => DMS.upgradeDungeon(dms), /Tier 2 remains sealed/);
  assert.ok(dms.dungeon.resources.construction.grades.Basic >= DMS.tierRules(2).upgradeCost.construction);
  assert.ok(dms.dungeon.resources.energy.amount >= DMS.tierRules(2).upgradeCost.energy);
});
