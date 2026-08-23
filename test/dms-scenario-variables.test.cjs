const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.state = {};
global.storyCards = [];
global.history = [];
global.info = { actionCount: 0, maxChars: 12000 };
global.log = () => {};
global.text = "";
global.stop = false;
const DMS = require("../Library.js");

test("setup Story Cards stay compact and use the runtime's exact question identities", () => {
  const cards = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "DMS Scenario Setup Story Cards.json"), "utf8"));
  assert.equal(cards.length, 5);
  assert.equal(new Set(cards.map(card => card.keys.toLowerCase())).size, cards.length);
  assert.ok(cards.every(card => card.value.length <= 1000));
  assert.ok(cards.every(card => /^DMS_SETUP_VARIABLES_/.test(card.keys)));
  const questions = [...cards.map(card => card.value).join("\n").matchAll(/\$\{([^}]*)\}/g)].map(match => match[1]);
  assert.deepEqual(new Set(questions), new Set(Object.values(DMS.SCENARIO_QUESTIONS)));
});

function placeholders(overrides = {}) {
  const answers = {
    thronebound: "Mara",
    race: "Voidkin",
    dungeonName: "The Ashen Court",
    theme: "Volcanic necromancy",
    style: "Gothic basalt fortress",
    workers: "masked ashbound skeletons",
    soldiers: "ember-wreathed revenants",
    homeworld: "Caelus",
    secondaryLocation: "The Crossroads",
    construction: "Graveglass | Black volcanic crystal. | Quarried from ossuary flows. | Shapes rooms and fortifications.",
    sustenance: "Cinder Marrow | Heat-rich spiritual biomass. | Rendered from char gardens. | Sustains dungeon population.",
    development: "Sovereign Ichor | Concentrated adaptive essence. | Refined from resonance. | Develops linked characters.",
    energy: "Pyreflow | Necromantic command energy. | Drawn through the throne. | Powers dungeon functions.",
    Might: "SSS | 5",
    Agility: "A | 4",
    Endurance: "S | 4",
    Arcana: "B | 3",
    Command: "SS | 5",
    Logistics: "A | 4",
    Insight: "S | 4",
    Craft: "C | 2",
    uniqueAttributes: "Cinder Sovereignty | Authority over the dungeon's living flame. | 3; Grave Resonance | Affinity with bound spirits. | 2",
    ...overrides
  };
  return Object.entries(DMS.SCENARIO_QUESTIONS).map(([field, question]) => ({ question, answer: answers[field] || "" }));
}

test("resolved scenario variables atomically initialize the complete Tier 0 identity", () => {
  const dms = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders()), true);
  assert.equal(DMS.identityReady(dms), true);
  assert.equal(dms.thronebound.name, "Mara");
  assert.equal(dms.dungeon.name, "The Ashen Court");
  assert.equal(dms.dungeon.resources.construction.name, "Graveglass");
  assert.equal(dms.thronebound.attributes.combat.Might.aptitude, "SSS");
  assert.equal(dms.thronebound.attributes.combat.Might.preference, 5);
  assert.equal(dms.thronebound.attributes.unique["Cinder Sovereignty"].value, 3);
  assert.equal(dms.onboarding.scenarioVariablesImported, true);
  assert.deepEqual(Object.keys(dms.rooms), ["room-throne"]);
});

test("scenario initialization is retry-safe and never overwrites established state", () => {
  const dms = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders()), true);
  const revision = dms.persistence.revision, signature = dms.onboarding.scenarioVariableSignature;
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders({ thronebound: "Retry Name" })), false);
  assert.equal(dms.thronebound.name, "Mara");
  assert.equal(dms.persistence.revision, revision);
  assert.equal(dms.onboarding.scenarioVariableSignature, signature);

  const manual = DMS.defaultState();
  DMS.configure(manual, { thronebound: "Existing", race: "Human" });
  assert.equal(DMS.initializeFromScenarioVariables(manual, placeholders()), false);
  assert.equal(manual.thronebound.name, "Existing");
});

test("missing or malformed scenario answers cannot partially initialize state", () => {
  const missing = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(missing, placeholders({ theme: "" })), false);
  assert.equal(missing.dungeon.name, "Unnamed Dungeon");
  assert.equal(missing.persistence.revision, 0);

  const malformed = DMS.defaultState();
  assert.throws(() => DMS.initializeFromScenarioVariables(malformed, placeholders({ construction: "Only a name" })), /Name \| Description/);
  assert.equal(malformed.dungeon.name, "Unnamed Dungeon");
  assert.equal(malformed.persistence.revision, 0);
});

test("Plot Essentials and Author's Note receive compact managed state without clobbering user text", () => {
  const dms = DMS.defaultState();
  DMS.initializeFromScenarioVariables(dms, placeholders());
  global.state = { memory: { context: "Keep this plot fact.", authorsNote: "Write in close second person." } };
  assert.equal(DMS.syncScenarioPlot(dms), true);
  assert.match(global.state.memory.context, /Keep this plot fact\./);
  assert.match(global.state.memory.context, /\[DMS PLOT ESSENTIALS\]/);
  assert.match(global.state.memory.context, /Skills: None/);
  assert.doesNotMatch(global.state.memory.context, /No Class has been selected/);
  assert.match(global.state.memory.authorsNote, /Write in close second person\./);
  assert.match(global.state.memory.authorsNote, /\[DMS ACTIVITY STATE\]/);
  assert.match(global.state.memory.authorsNote, /Location: Dungeon — Throne Room/);

  DMS.setActivity(dms, "System", [], "Timeless");
  DMS.syncScenarioPlot(dms);
  assert.equal((global.state.memory.authorsNote.match(/\[DMS ACTIVITY STATE\]/g) || []).length, 1);
  assert.match(global.state.memory.authorsNote, /Mode: System/);
});

test("scenario-variable import marker survives compact save recovery", () => {
  global.storyCards.length = 0;
  const dms = DMS.defaultState();
  DMS.initializeFromScenarioVariables(dms, placeholders());
  DMS.refreshCards(dms);
  const snapshot = DMS.readSaveCards();
  const loaded = DMS.loadSaveCards(undefined, snapshot);
  assert.equal(loaded.onboarding.scenarioVariablesImported, true);
  assert.equal(loaded.onboarding.scenarioVariableSignature, dms.onboarding.scenarioVariableSignature);
  assert.equal(loaded.thronebound.name, "Mara");
});
