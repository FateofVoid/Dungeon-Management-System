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
  DMS.confirmAptitudes(dms);
  return dms;
}
function rich(dms, amount = 100000) { for (const role of DMS.RESOURCE_ROLES) dms.dungeon.resources[role].amount = amount; return dms; }
function systemMode(dms) { DMS.setLocation(dms, "Dungeon", "Throne Room"); DMS.setActivity(dms, "System", [], "Timeless"); return dms; }
function finishTasks(dms) { let guard = 100; while (dms.tasks.length && guard-- > 0) DMS.resolveCycle(dms); if (dms.tasks.length) throw new Error("Task guard exhausted"); return dms; }
function build(dms, definition) { const room = DMS.createRoom(dms, definition); finishTasks(dms); return room; }
function awakenTier1() { const dms = rich(systemMode(configured())); DMS.summonAdministrator(dms, "Veyra", "Ashborn"); DMS.upgradeDungeon(dms); return dms; }

test("starts at Tier 0 with only the Throne Room and a Classless Thronebound", () => {
  const dms = configured();
  assert.equal(dms.dungeon.tier, 0);
  assert.deepEqual(Object.keys(dms.rooms), ["room-throne"]);
  assert.equal(dms.rooms["room-throne"].tier, 0);
  assert.equal(dms.thronebound.class.name, "Classless");
  assert.equal(dms.thronebound.class.tier, 0);
  assert.equal(dms.dungeon.administratorCapacity, 1);
});

test("requires the first summoned Manager and full Administrator Capacity for Tier Up", () => {
  const dms = rich(configured());
  assert.throws(() => DMS.upgradeDungeon(dms), /System Mode within the Throne Room/);
  assert.throws(() => DMS.summonAdministrator(dms), /System Mode/);
  systemMode(dms);
  assert.throws(() => DMS.upgradeDungeon(dms), /Fill Administrator Capacity/);
  const manager = DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  assert.equal(manager.role, "Manager");
  assert.ok(DMS.ADMINISTRATOR_RANKS.includes(manager.rank));
  DMS.upgradeDungeon(dms);
  assert.equal(dms.dungeon.tier, 1);
  assert.equal(dms.rooms["room-throne"].tier, 1);
  assert.equal(dms.dungeon.administratorCapacity, 3);
  assert.throws(() => DMS.upgradeDungeon(dms), /Fill Administrator Capacity/);
});

test("Administrator Capacity grows by two per Tier and every Tier unlocks facilities", () => {
  for (let tier = 0; tier <= 10; tier++) {
    assert.equal(DMS.tierRules(tier).administratorCapacity, 1 + tier * 2);
    assert.ok(Object.values(DMS.ROOM_DEFINITIONS).some(room => room.unlockTier === tier), `Tier ${tier} lacks a facility`);
  }
});

test("has no global Room or population capacity", () => {
  const dms = awakenTier1();
  assert.equal(Object.hasOwn(dms.dungeon, "roomCapacity"), false);
  assert.equal(Object.hasOwn(dms.population.workers, "capacity"), false);
  assert.equal(Object.hasOwn(dms.population.soldiers, "capacity"), false);
});

test("construction and expansion advance through Cycles and expansion grows job population", () => {
  const dms = awakenTier1();
  const room = DMS.createRoom(dms, "material-works");
  assert.equal(room.state, "Constructing");
  assert.equal(room.jobPopulation, 0);
  DMS.resolveCycle(dms);
  assert.equal(room.state, "Active");
  assert.equal(room.jobPopulation, 4);
  DMS.expandRoom(dms, room.id);
  assert.equal(room.state, "Expanding");
  finishTasks(dms);
  assert.equal(room.expansion, 2);
  assert.equal(room.jobPopulation, 8);
});

test("facility Tier Up updates Appearance and yield without increasing jobs", () => {
  const dms = awakenTier1();
  const room = build(dms, "material-works");
  const jobs = room.jobPopulation;
  dms.dungeon.tier = 2; DMS.applyDerivedState(dms); rich(dms);
  DMS.upgradeRoom(dms, room.id); finishTasks(dms);
  assert.equal(room.tier, 2);
  assert.equal(room.jobPopulation, jobs);
  assert.match(room.lore.appearance, /Tier 2/);
});

test("creates separate facility-unlock and job-cohort lore cards", () => {
  global.storyCards.length = 0;
  const dms = awakenTier1();
  DMS.refreshCards(dms);
  assert.ok(global.storyCards.some(card => card.title === "DMS Facility Unlock — Material Works"));
  const room = build(dms, "material-works"); DMS.refreshCards(dms);
  assert.ok(global.storyCards.some(card => card.title.includes(`DMS Job Cohort — ${room.id}`) && /Typical Appearance:/.test(card.entry)));
});

test("later summons select deterministic random roles limited to active facility functions", () => {
  const dms = awakenTier1();
  build(dms, "material-works");
  const second = DMS.summonAdministrator(dms, "Kara", "Ashborn");
  assert.notEqual(second.role, "Manager");
  assert.ok(["Production Overseer"].includes(second.role));
});

test("Administrator assignment validates role and Rank modifies facility production", () => {
  const dms = awakenTier1(), room = build(dms, "material-works");
  const admin = DMS.summonAdministrator(dms, "Kara", "Ashborn");
  DMS.assignAdministrator(dms, admin.id, room.id);
  const before = dms.dungeon.resources.construction.amount;
  const report = DMS.resolveCycle(dms);
  assert.equal(report.dungeonResources.construction, Number((4 * 3 * admin.effectiveness).toFixed(2)));
  assert.equal(dms.dungeon.resources.construction.amount, before + report.dungeonResources.construction);
});

test("automatically registers summoned Administrators with Inner Self", () => {
  global.storyCards.length = 0;
  global.storyCards.push({ title: "Configure \nInner Self", notes: "" });
  const dms = rich(systemMode(configured())), admin = DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  assert.ok(global.storyCards.some(card => card.title === `@${admin.name}`));
  assert.match(global.storyCards.find(card => /^Configure/.test(card.title)).notes, /Veyra/);
});

test("Bond stops at every 5 percent Event until its Bond Quest is completed", () => {
  const dms = rich(systemMode(configured())), admin = DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  DMS.addAdministratorBond(dms, admin.id, 50);
  assert.equal(admin.bond.value, 5);
  assert.equal(DMS.addAdministratorBond(dms, admin.id, 5).value, 5);
  assert.equal(dms.quests.records[`bond-${admin.id}-5`].category, "Bond");
  DMS.completeBondEvent(dms, admin.id);
  DMS.addAdministratorBond(dms, admin.id, 50);
  assert.equal(admin.bond.value, 10);
});

test("Bond soft locks can require higher-tier gifts or non-Dungeon locations", () => {
  const dms = rich(systemMode(configured())), admin = DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  dms.dungeon.tier = 1; DMS.applyDerivedState(dms);
  for (const threshold of [5, 10, 15]) { DMS.addAdministratorBond(dms, admin.id, 100); if (threshold === 15) assert.throws(() => DMS.completeBondEvent(dms, admin.id), /outside the Dungeon/); else DMS.completeBondEvent(dms, admin.id); }
  DMS.setLocation(dms, "Homeworld", "Capital");
  DMS.completeBondEvent(dms, admin.id);
  for (const threshold of [20, 25]) { DMS.addAdministratorBond(dms, admin.id, 100); DMS.completeBondEvent(dms, admin.id); }
  DMS.addAdministratorBond(dms, admin.id, 100); assert.equal(admin.bond.value, 30);
  assert.throws(() => DMS.completeBondEvent(dms, admin.id), /Tier 2/);
});

test("Administrator Rank Up is Bond-gated", () => {
  const dms = rich(systemMode(configured())), admin = DMS.summonAdministrator(dms, "Veyra", "Ashborn");
  if (admin.rank === "SSS") return;
  assert.throws(() => DMS.rankUpAdministrator(dms, admin.id), /requires Bond/);
  admin.bond.value = 100;
  const previous = DMS.ADMINISTRATOR_RANKS.indexOf(admin.rank);
  DMS.rankUpAdministrator(dms, admin.id);
  assert.equal(DMS.ADMINISTRATOR_RANKS.indexOf(admin.rank), previous + 1);
});

test("Tier 1 generates three editable Thronebound Class branch cards", () => {
  global.storyCards.length = 0;
  const dms = awakenTier1(); DMS.refreshCards(dms);
  assert.equal(dms.classPreviews.thronebound.length, 3);
  assert.equal(global.storyCards.filter(card => card.title.startsWith("DMS Class Preview — thronebound")).length, 3);
  const card = global.storyCards.find(item => item.title === "DMS Class Preview — thronebound — Option 1");
  card.entry = card.entry.replace(/^Class:.+$/m, "Class: Ash Imperator");
  DMS.acceptClassPreview(dms, "thronebound", 1);
  assert.equal(dms.thronebound.class.name, "Ash Imperator");
  assert.equal(dms.thronebound.class.tier, 1);
  assert.equal(dms.thronebound.class.skills.length, 2);
  assert.equal(dms.thronebound.class.traits.length, 1);
});

test("later Thronebound Class Ups require the Evolution Chamber at the target Tier", () => {
  const dms = awakenTier1(); DMS.acceptClassPreview(dms, "thronebound", 1);
  const chamber = build(dms, "class-evolution-chamber");
  dms.dungeon.tier = 2; DMS.applyDerivedState(dms); rich(dms); DMS.generateClassPreviews(dms, "thronebound");
  assert.throws(() => DMS.acceptClassPreview(dms, "thronebound", 1), /Chamber at Tier 2/);
  DMS.upgradeRoom(dms, chamber.id); finishTasks(dms);
  DMS.acceptClassPreview(dms, "thronebound", 1);
  assert.equal(dms.thronebound.class.tier, 2);
});

test("Administrator Class evolution grants only its matching Skill category and one Trait", () => {
  const dms = awakenTier1(), chamber = build(dms, "class-evolution-chamber"), admin = Object.values(dms.administrators)[0];
  assert.equal(dms.classPreviews[admin.id].length, 1);
  DMS.acceptClassPreview(dms, admin.id, 1);
  assert.equal(admin.class.skills.length, 1);
  assert.equal(admin.class.skills[0].category, admin.attributeSpecialization);
  assert.equal(admin.class.traits.length, 1);
  assert.equal(chamber.tier, 1);
});

test("rejects duplicate Skills and tracks mastery and Grades", () => {
  const dms = awakenTier1(); DMS.acceptClassPreview(dms, "thronebound", 1); const skill = dms.thronebound.class.skills[0];
  assert.throws(() => DMS.buySkill(dms, "thronebound", skill.name, "Duplicate", 1), /Duplicate Skill/);
  rich(dms); assert.throws(() => DMS.trainSkill(dms, "thronebound", skill.name, 100), /Attribute Training Hall/);
  dms.dungeon.tier = 2; DMS.applyDerivedState(dms); build(dms, "attribute-training-hall"); DMS.trainSkill(dms, "thronebound", skill.name, 100); assert.equal(skill.mastery, 100);
  dms.dungeon.tier = 4; DMS.upgradeSkillGrade(dms, "thronebound", skill.name); assert.equal(skill.gradeName, "Intermediate");
});

test("general Skill and Trait shop cards are generated by separate facilities", () => {
  global.storyCards.length = 0;
  const dms = awakenTier1(); build(dms, "general-skill-hall"); build(dms, "general-trait-archive"); DMS.refreshCards(dms);
  assert.ok(global.storyCards.some(card => card.title === "DMS General Skill Shop — Tier 1"));
  assert.ok(global.storyCards.some(card => card.title === "DMS General Trait Shop — Tier 1"));
  rich(dms); const entry = DMS.buyShopEntry(dms, "thronebound", "skill", 1, 2);
  assert.ok(dms.thronebound.class.skills.some(skill => skill.name === entry.name && skill.source === "General Shop"));
});

test("custom shops require Laboratory research and their dedicated facility", () => {
  const dms = rich(awakenTier1()); dms.dungeon.tier = 4; DMS.applyDerivedState(dms);
  const lab = build(dms, "laboratory");
  assert.throws(() => DMS.createRoom(dms, "custom-skill-studio"), /research/);
  DMS.researchCustomShop(dms, "skill", "Blood geometry"); finishTasks(dms);
  build(dms, "custom-skill-studio");
  const shop = DMS.defineCustomShop(dms, "skill", "Blood geometry");
  assert.match(shop.entries[0].name, /Blood Geometry/);
  assert.equal(lab.state, "Active");
});

test("Quest Experience levels the Thronebound with Aptitude-based Attribute growth", () => {
  const dms = systemMode(configured()); DMS.configureAptitude(dms, "Might", "SSS", 5);
  const quest = DMS.createQuest(dms, "Personal", "Trial by Fire", "Survive the crucible.", { experience: 500 });
  const id = Object.keys(dms.quests.records).find(key => dms.quests.records[key] === quest);
  DMS.completeQuest(dms, id);
  assert.ok(dms.thronebound.level > 1);
  assert.equal(dms.thronebound.attributes.combat.Might.aptitude, "SSS");
  DMS.refreshCards(dms);
  assert.match(global.storyCards.find(card => card.title === "DMS — Thronebound").entry, /Might \[SSS\]:/);
});

test("Activity context loads matching location and target Lore Cards", () => {
  global.storyCards.length = 0;
  global.storyCards.push({ title: "Glasswild Reach", keys: "Glasswild frontier", entry: "A luminous frontier of singing crystal forests." });
  const dms = configured(); DMS.setLocation(dms, "Lustria", "Glasswild Reach"); DMS.setActivity(dms, "Exploration", ["Glasswild Reach"], "Slow");
  const context = DMS.contextGuidance(dms);
  assert.match(context, /Current Activity: Exploration/);
  assert.match(context, /luminous frontier/);
});

test("Activity turns advance allowed Paces and are retry-safe", () => {
  const dms = rich(awakenTier1()); dms.dungeon.tier = 2; DMS.applyDerivedState(dms); DMS.upgradeRoom(dms, "room-throne"); const before = dms.tasks[0].remaining; DMS.setActivity(dms, "Construction", [], "Fast");
  const result = DMS.applyActivityTurn(dms, "I help shape the chamber.", 10);
  assert.equal(dms.activity.progress, 0.5);
  assert.equal(result.task, dms.tasks[0].id);
  assert.ok(dms.tasks[0].remaining < before);
  const repeated = DMS.applyActivityTurn(dms, "I help shape the chamber.", 10);
  assert.equal(repeated.repeated, true);
  assert.equal(dms.activity.progress, 0.5);
  assert.throws(() => DMS.setActivity(dms, "System", [], "Fast"), /permits Pace/);
});

test("Input and Output hooks preserve silent command routing", () => {
  global.state.DMS = configured(); global.text = "/dms status"; global.DungeonManagement("input"); assert.equal(global.state.DMSCommandTurn, true); global.text = "model output"; global.DungeonManagement("output"); assert.match(global.text, /DUNGEON MANAGEMENT SYSTEM/); assert.equal(global.state.DMSCommandTurn, false);
});
