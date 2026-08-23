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

function run(dms, command) { return DMS.execute(dms, `/dms ${command}`); }

function defineTierZeroIdentity(dms) {
  run(dms, "setup Mara|Voidkin|The Ashen Court|Volcanic necromancy|Gothic basalt fortress|masked ashbound skeletons|ember-wreathed revenants|Caelus|The Crossroads");
  run(dms, "aptitudes confirm");
  run(dms, "resource define construction|Graveglass|Black volcanic crystal shot through with soul-light.|Quarried from cooling ossuary flows.|Shapes rooms and fortifications.");
  run(dms, "resource define sustenance|Cinder Marrow|Heat-rich spiritual biomass.|Rendered from fungal char gardens.|Sustains the dungeon population.");
  run(dms, "resource define development|Sovereign Ichor|Concentrated adaptive essence.|Refined from resonance.|Develops linked characters.");
  run(dms, "resource define energy|Pyreflow|Necromantic heat and command.|Drawn through the throne.|Primary dungeon currency.");
  return dms;
}

test("fresh Tier 0 completes both onboarding chains and reaches Tier 1 without injected resources", () => {
  global.storyCards.length = 0;
  const dms = defineTierZeroIdentity(DMS.defaultState());
  assert.equal(DMS.identityReady(dms), true);
  assert.equal(dms.thronebound.class.name, "Classless");
  assert.deepEqual(Object.keys(dms.rooms), ["room-throne"]);
  assert.equal(dms.rooms["room-throne"].tier, 0);
  assert.deepEqual(DMS.dungeonSignature(dms), { state: "Nascent", strength: 0, externallyDetectable: false, theme: "Volcanic necromancy" });

  const help = DMS.applyActivityTurn(dms, '> You say, "System, help me."', 0);
  const naturalStatus = DMS.applyActivityTurn(dms, '> You say, "System, show my Dungeon Status."', 1);
  const naturalResources = DMS.applyActivityTurn(dms, '> You say "System, show my resources."', 2);
  assert.match(help.system, /System Awakening — Read Dungeon Status/);
  assert.match(naturalStatus.system, /Dungeon: The Ashen Court/);
  assert.match(naturalResources.system, /Construction — Graveglass/);
  assert.equal(dms.activity.mode, "Idle", "read-only Throne Room System requests do not require entering management mode");
  const mode = DMS.applyActivityTurn(dms, '> You say "System, enter management mode."', 3);
  const summon = DMS.applyActivityTurn(dms, '> You say "System, summon the Manager."', 4).system;
  assert.match(mode.system, /Activity: System \/ Timeless/);
  const manager = Object.values(dms.administrators)[0];
  assert.match(summon, /Rank .* Manager/);
  assert.equal(manager.role, "Manager");
  assert.match(manager.name, /^Volcanic Manager 1$/, "the default first Administrator identity is derived from the Dungeon Theme");
  assert.equal(manager.race, "masked ashbound skeletons");
  assert.equal(manager.level, 1);
  assert.equal(manager.class.tier, 0);
  assert.ok(DMS.ADMINISTRATOR_RANKS.includes(manager.rank));
  assert.equal(manager.bond.value, 0);
  assert.ok(global.storyCards.some(card => card.keys === `DMS_ADMIN_${manager.id.toUpperCase().replace(/\W/g, "_")}`));
  assert.ok(global.storyCards.some(card => card.title === `@${manager.name}`));

  const requirements = DMS.applyActivityTurn(dms, '> You ask: "System, what is required to awaken Tier 1?"', 5);
  assert.match(requirements.system, /Tier 1 requires Administrator Capacity 1\/1 filled/);
  const constructionBefore = dms.dungeon.resources.construction.grades.Basic;
  const energyBefore = dms.dungeon.resources.energy.amount;
  const awakening = DMS.applyActivityTurn(dms, '> You say "System, awaken Tier 1."', 6);
  assert.match(awakening.system, /Dungeon advanced to Tier 1/);

  assert.equal(dms.dungeon.tier, 1);
  assert.equal(dms.dungeon.administratorCapacity, 3);
  assert.equal(dms.rooms["room-throne"].tier, 1);
  assert.equal(dms.thronebound.class.name, "Classless", "Tier Up generates previews but does not select a Class");
  assert.equal(dms.dungeon.resources.construction.grades.Basic, constructionBefore - 50);
  assert.equal(dms.dungeon.resources.energy.amount, energyBefore - 30 + 20, "Tier Up cost and its quest reward are both authoritative");
  for (const quest of Object.values(dms.quests.records).filter(quest => ["Survive the Awakening", "System Awakening"].includes(quest.chain))) assert.equal(quest.status, "cleared", `${quest.title} should clear through normal play`);
});

test("Release A seals Dungeon Tier 2 until its deployment gate is verified", () => {
  const dms = defineTierZeroIdentity(DMS.defaultState());
  DMS.setActivity(dms, "System", [], "Timeless");
  DMS.summonAdministrator(dms);
  DMS.upgradeDungeon(dms);
  assert.throws(() => DMS.upgradeDungeon(dms), /verified through Dungeon Tier 1/);
  DMS.summonAdministrator(dms);
  DMS.summonAdministrator(dms);
  assert.equal(DMS.VERIFIED_DUNGEON_TIER, 1);
  assert.match(DMS.tierRequirementsStatus(dms), /Tier 2 requirements remain sealed/);
  assert.throws(() => DMS.upgradeDungeon(dms), /verified through Dungeon Tier 1/);
  assert.equal(dms.dungeon.tier, 1);
});

test("spoken System requests replace model output with an authoritative immersive response", () => {
  global.storyCards.length = 0;
  global.state = { DMS: defineTierZeroIdentity(DMS.defaultState()) };
  global.info = { actionCount: 700, maxChars: 12000 };
  global.text = '> You say, "System, show my Dungeon Status."';
  global.DungeonManagement("input");
  assert.equal(global.state.DMSVoiceTurn, true);
  global.DungeonManagement("context");
  global.text = "This model text must be replaced.";
  global.DungeonManagement("output");
  assert.match(global.text, /^> \*\*DUNGEON MANAGEMENT SYSTEM\*\*/);
  assert.match(global.text, /Dungeon: The Ashen Court/);
  assert.doesNotMatch(global.text, /model text/);
});

test("natural System help accepts an immersive request for understanding", () => {
  assert.equal(DMS.naturalSystemCommand('You say, "System, help me understand the Dungeon."'), "system help");
});

test("Tier 0 throne-only System operations reject use elsewhere", () => {
  const dms = defineTierZeroIdentity(DMS.defaultState());
  run(dms, "location Homeworld|Caelus");
  assert.throws(() => run(dms, "mode System||Timeless"), /only be entered within the Throne Room/);
  assert.throws(() => run(dms, "setup Mara|Voidkin|Changed Dungeon|Changed Theme|Changed Style|workers|soldiers|Caelus"), /only be changed in System Mode within the Throne Room/);
  assert.throws(() => run(dms, "resource define energy|Changed Energy|Description.|Collected.|Used."), /only be redefined in System Mode within the Throne Room/);
  assert.equal(Object.keys(dms.portals.anchors).length, 0, "Tier 0 Gate Authority is context only and creates no gameplay Anchor");
  run(dms, "location Dungeon|Throne Room");
  run(dms, "mode System||Timeless");
  run(dms, "administrator summon");
  run(dms, "mode Administration||Timeless");
  assert.throws(() => run(dms, "dungeon upgrade"), /System Mode within the Throne Room/);
});

test("cold runtime-cache recovery restores the complete authoritative Tier 0 gate", () => {
  global.storyCards.length = 0;
  const dms = defineTierZeroIdentity(DMS.defaultState());
  run(dms, "status");
  run(dms, "resources");
  run(dms, "mode System||Timeless");
  run(dms, "administrator summon");
  const manager = Object.values(dms.administrators)[0];
  DMS.addAdministratorBond(dms, manager.id, 5);
  run(dms, "tier requirements");
  run(dms, "mode Production||Fast");
  DMS.advanceActivity(dms, 2);
  DMS.refreshCards(dms);
  const saveCards = global.storyCards.filter(card => card.title.startsWith("DMS Save — "));
  assert.ok(saveCards.length >= 2);
  assert.ok(saveCards.every(card => card.entry.length <= DMS.SAVE_CARD_TARGET), "Tier 0 save cards should remain within the preferred target");

  const expected = {
    revision: dms.persistence.revision,
    cycle: dms.activity.cycle,
    progress: dms.activity.progress,
    construction: dms.dungeon.resources.construction.grades.Basic,
    energy: dms.dungeon.resources.energy.amount,
    rank: manager.rank,
    bond: manager.bond.value,
    quests: Object.fromEntries(Object.entries(dms.quests.records).map(([id, quest]) => [id, quest.status]))
  };
  global.state = {};
  global.text = "";
  global.DungeonManagement("context");
  const restored = global.state.DMS, restoredManager = restored.administrators[manager.id];

  assert.equal(restored.dungeon.tier, 0);
  assert.equal(restored.dungeon.name, "The Ashen Court");
  assert.equal(restored.thronebound.name, "Mara");
  assert.equal(restored.persistence.revision, expected.revision);
  assert.equal(restored.activity.cycle, expected.cycle);
  assert.equal(restored.activity.progress, expected.progress);
  assert.equal(restored.dungeon.resources.construction.grades.Basic, expected.construction);
  assert.equal(restored.dungeon.resources.energy.amount, expected.energy);
  assert.equal(restoredManager.rank, expected.rank);
  assert.equal(restoredManager.level, 1);
  assert.equal(restoredManager.bond.value, expected.bond);
  assert.deepEqual(Object.fromEntries(Object.entries(restored.quests.records).map(([id, quest]) => [id, quest.status])), expected.quests);
  assert.equal(DMS.identityReady(restored), true);
});
