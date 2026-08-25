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

function atTierOne() {
  const dms = DMS.defaultState();
  dms.dungeon.name = "Queen's Vault";
  dms.dungeon.theme = "Veiled obsidian sovereignty";
  dms.activity.mode = "System";
  DMS.summonAdministrator(dms, "Veyra", "Veiled Court");
  dms.dungeon.tier = 1;
  dms.quests.records["story-awakening-1"].status = "cleared";
  DMS.applyDerivedState(dms);
  DMS.updateQuests(dms, { notify: false });
  return dms;
}

function captureLocalPoint(dms, label, narrative) {
  DMS.addDungeonSectorTravelContext(dms);
  DMS.scheduleDungeonSectorSnapshot(dms, label);
  return DMS.capturePendingDungeonSectorSnapshot(dms, narrative);
}

test("Tier 0 Story is one broad awakening and does not duplicate tutorial operations", () => {
  const dms = DMS.defaultState(), story = Object.values(dms.quests.records).filter(quest => quest.category === "Story");
  assert.equal(story.filter(quest => quest.status === "active").length, 1);
  assert.equal(story.find(quest => quest.status === "active").id, "story-awakening-1");
  assert.doesNotMatch(story[0].objective, /Status|Resources|summon|Administrator Capacity/i);
  assert.equal(DMS.storyMapStatus(dms).includes("Concealment"), false, "future branches remain hidden");
});

test("Dungeon Sector snapshots are delayed until a later action after travel and investigation", () => {
  const dms = atTierOne();
  DMS.beginDungeonExterior(dms);
  assert.equal(dms.story.dungeonSector.exteriorEntered, true);
  assert.equal(dms.story.dungeonSector.observations.length, 0, "leaving never snapshots the quest-triggering output");
  assert.equal(dms.story.dungeonSector.discoveryState, "Unobserved");
  assert.equal(dms.quests.records["story-first-contact-2"].status, "active");
  assert.throws(() => DMS.scheduleDungeonSectorSnapshot(dms, "too early"), /more travel or survey context/);
  DMS.addDungeonSectorTravelContext(dms);
  DMS.addDungeonSectorTravelContext(dms);
  DMS.scheduleDungeonSectorSnapshot(dms, "Investigate the first landmark");
  assert.equal(dms.story.dungeonSector.observations.length, 0, "scheduling leaves an edit window");
  const observation = DMS.capturePendingDungeonSectorSnapshot(dms, "A cold grey shoreline runs beneath black cliffs. Broken columns stand in the surf.");
  assert.equal(observation.phase, "First Exit");
  assert.match(observation.summary, /cold grey shoreline/);
  assert.equal(dms.story.dungeonSector.discoveryState, "Initial Observation");
});

test("ordinary story actions schedule delayed snapshots and confirm intrusion outcomes", () => {
  const dms = atTierOne();
  DMS.applyActivityTurn(dms, "I walk through the Dungeon entrance and step outside.", 1);
  DMS.applyActivityTurn(dms, "I continue walking around the immediate vicinity.", 2);
  DMS.applyActivityTurn(dms, "I follow the perimeter farther from the entrance.", 3);
  DMS.applyActivityTurn(dms, "I investigate a nearby landmark in the area.", 4);
  assert.ok(dms.story.dungeonSector.pendingSnapshot);
  assert.equal(dms.story.dungeonSector.observations.length, 0);
  global.history = [{ rawText: "A weathered marker stands above a narrow route through the surrounding stone." }];
  DMS.applyActivityTurn(dms, "I continue along the perimeter after examining the marker.", 5);
  assert.match(dms.story.dungeonSector.observations[0].summary, /weathered marker/);

  dms.quests.records["story-first-contact-2"].status = "cleared"; DMS.updateQuests(dms, { notify: false });
  assert.equal(dms.story.intrusion.active, true);
  DMS.applyActivityTurn(dms, "I negotiate and order the intruders to withdraw.", 6);
  assert.ok(dms.story.intrusion.pendingResolution);
  global.history = [{ rawText: "After a guarded exchange, the armed figures withdraw beyond the threshold." }];
  DMS.applyActivityTurn(dms, "With the intruders gone and the threat ended, I assess the Dungeon.", 7);
  assert.equal(dms.story.intrusion.active, false);
  assert.equal(dms.quests.records["story-first-contact-3"].status, "cleared");
  global.history = [];
});

test("First Contact builds local canon from evidence and permits noncombat intrusion resolution", () => {
  const dms = atTierOne(); DMS.beginDungeonExterior(dms);
  DMS.addDungeonSectorTravelContext(dms);
  captureLocalPoint(dms, "Shore marker", "A cold shoreline and dark cliffs frame the Dungeon entrance.");
  captureLocalPoint(dms, "Broken columns", "Broken columns rise from shallow surf southeast of the entrance.");
  captureLocalPoint(dms, "Upland trail", "A narrow upland trail is reachable north of the Dungeon.");
  assert.equal(dms.quests.records["story-first-contact-2"].status, "cleared");
  assert.equal(dms.quests.records["story-first-contact-3"].status, "active");
  assert.equal(dms.story.intrusion.active, true);
  DMS.resolveStoryIntrusion(dms, { classification: "Unidentified hostile scouts", resolution: "Negotiated withdrawal", evidence: "Armed figures crossed the threshold, then withdrew after a guarded exchange." });
  assert.equal(dms.quests.records["story-first-contact-3"].status, "cleared");
  assert.equal(dms.quests.records["story-first-contact-4"].status, "active");
  DMS.compileDungeonSectorReport(dms, { name: "Blackcliff Shore", biome: "Cold coast", landmarks: ["Broken surf columns"], routes: ["Northern upland trail"], certainty: "Local survey" });
  assert.equal(dms.story.dungeonSector.classification.terrain, "Unknown", "the Manager does not invent an omitted field");
  DMS.reviewDungeonSectorReport(dms);
  assert.equal(dms.story.dungeonSector.discoveryState, "Mapped");
  assert.equal(dms.quests.records["story-first-contact-4"].status, "cleared");
});

test("Tier 2 generates named remote references before their Story quests present them", () => {
  const dms = atTierOne();
  for (const id of ["story-first-contact-1", "story-first-contact-2", "story-first-contact-3", "story-first-contact-4"]) dms.quests.records[id].status = "cleared";
  dms.dungeon.tier = 2; DMS.applyDerivedState(dms); DMS.updateQuests(dms, { notify: false });
  const sector = dms.world.lustria.sectors[dms.story.remote.sectorId];
  assert.ok(sector);
  assert.equal(dms.quests.records["story-beyond-perimeter-1"].status, "active");
  assert.match(dms.quests.records["story-beyond-perimeter-1"].objective, new RegExp(sector.name));
  DMS.visitStoryLocation(dms, sector.id);
  const site = dms.world.lustria.sites[dms.story.remote.siteId];
  assert.ok(site);
  assert.equal(dms.quests.records["story-beyond-perimeter-2"].status, "active");
  assert.match(dms.quests.records["story-beyond-perimeter-2"].objective, new RegExp(site.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("Development Path branches reveal only after adaptation and reconverge at Tier 3", () => {
  const dms = atTierOne();
  for (const id of ["story-first-contact-1", "story-first-contact-2", "story-first-contact-3", "story-first-contact-4", "story-beyond-perimeter-1", "story-beyond-perimeter-2", "story-beyond-perimeter-3", "story-beyond-perimeter-4", "story-beyond-perimeter-5"]) dms.quests.records[id].status = "cleared";
  dms.dungeon.tier = 2; dms.story.knowledge.adaptationDiscovered = true; dms.story.knownPaths = Object.keys(DMS.STORY_DEVELOPMENT_PATHS); DMS.updateQuests(dms, { notify: false });
  assert.match(DMS.storyMapStatus(dms), /Known Branches: Concealment, Controlled Contact, Dominion Accord, Patronage, Armed Independence/);
  DMS.selectDevelopmentPath(dms, "Controlled Contact");
  assert.equal(dms.quests.records["story-development-path-1"].status, "cleared");
  assert.equal(DMS.storyRequirementForTier(3), "story-development-path-1");
  dms.dungeon.tier = 3; DMS.updateQuests(dms, { notify: false });
  DMS.recordStoryMilestone(dms, "tier3-adaptation-applied", "A controlled meeting place was established.");
  assert.equal(dms.quests.records["story-path-controlled-contact-1"].status, "active");
  assert.equal(dms.quests.records["story-path-concealment-1"].status, "locked");
  DMS.recordStoryMilestone(dms, "path-trial:controlled-contact", "The first meeting concluded under controlled access.");
  assert.equal(dms.quests.records["story-dungeons-place-3"].status, "active");
  DMS.commitDevelopmentPath(dms);
  assert.equal(dms.quests.records["story-dungeons-place-3"].status, "cleared");
  assert.equal(dms.story.milestones.doctrine, "Measured Exchange");
});

test("Story state, observations, Sites, and branch selection survive save-card recovery", () => {
  global.storyCards.length = 0;
  const dms = atTierOne(); DMS.beginDungeonExterior(dms); DMS.addDungeonSectorTravelContext(dms); DMS.addDungeonSectorTravelContext(dms); DMS.scheduleDungeonSectorSnapshot(dms, "Local point"); DMS.capturePendingDungeonSectorSnapshot(dms, "The editable preceding output establishes a basalt marker beside the route.");
  dms.story.knowledge.adaptationDiscovered = true; dms.story.knownPaths = Object.keys(DMS.STORY_DEVELOPMENT_PATHS); dms.story.selectedPath = "concealment";
  const sector = DMS.ensureStoryRemoteSector(dms), site = DMS.ensureStoryRemoteSite(dms); DMS.refreshCards(dms);
  const loaded = DMS.loadSaveCards(DMS.defaultState());
  assert.equal(loaded.story.selectedPath, "concealment");
  assert.equal(loaded.story.dungeonSector.observations[0].summary, dms.story.dungeonSector.observations[0].summary);
  assert.equal(loaded.world.lustria.sectors[sector.id].name, sector.name);
  assert.equal(loaded.world.lustria.sites[site.id].name, site.name);
  assert.doesNotThrow(() => DMS.assertSaveCardCharacterLimits());
});
