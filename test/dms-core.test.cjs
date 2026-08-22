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

test("setup requires a complete user-defined dungeon identity", () => {
  const state = DMS.defaultState();
  DMS.configure(state, { tronebound: "Mara", name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic fortress", population: "skeletons, ember wraiths" });
  assert.equal(state.initialized, true);
  assert.deepEqual(state.dungeon.population, ["skeletons", "ember wraiths"]);
  assert.equal(state.quests.records["establish-core"].status, "cleared");
});

test("room generation is deterministic and constrained by dungeon identity", () => {
  const make = () => {
    const state = DMS.defaultState();
    DMS.configure(state, { name: "The Ashen Court", theme: "Volcanic necromancy", style: "Gothic fortress", population: ["skeletons", "ember wraiths"] });
    return DMS.generateRoom(state);
  };
  assert.deepEqual(make(), make());
  const room = make();
  assert.equal(room.theme, "Volcanic necromancy");
  assert.equal(room.style, "Gothic fortress");
  assert.ok(["skeletons", "ember wraiths"].includes(room.population[0]));
});

test("administrator identity comes from the dungeon population", () => {
  const state = DMS.defaultState();
  DMS.configure(state, { theme: "Clockwork abyss", style: "Brutalist machinery", population: ["brass servitors", "gear devils"] });
  const admin = DMS.generateAdministrator(state, "Veyra", "Warden");
  assert.equal(admin.name, "Veyra");
  assert.equal(admin.role, "Warden");
  assert.ok(state.dungeon.population.includes(admin.origin));
});

test("managed commands create rooms and unlock the administrator quest", () => {
  const state = DMS.defaultState();
  DMS.execute(state, "/dms setup Nox|The Deep|Living ocean|Organic labyrinth|reefkin, abyssal beasts");
  DMS.execute(state, "/dms room generate Habitat");
  assert.equal(Object.keys(state.rooms).length, 1);
  assert.equal(state.quests.records["shape-first-room"].status, "cleared");
  assert.equal(state.quests.records["appoint-first-administrator"].status, "active");
});

test("activity cycles award dungeon power without narrative authority", () => {
  const state = DMS.defaultState();
  DMS.configure(state, { theme: "Crystal hive", style: "Prismatic", population: ["shard drones"] });
  DMS.generateRoom(state, "Lair");
  DMS.setActivity(state, "Construction", ["room-1"], "Immediate");
  DMS.advanceActivity(state);
  assert.equal(state.activity.cycle, 1);
  assert.equal(state.dungeon.power, 1);
});
