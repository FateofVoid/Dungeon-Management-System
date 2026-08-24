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

function playerInput() {
  return { details: "A volcanic necromantic Dungeon bound to Mara.", tags: "dark fantasy, volcanic, undead", sexualContent: "Mature romantic content", kinkContent: "None" };
}
function generatedSections() {
  return [
    { Tags: "dark fantasy, volcanic, undead", Dungeon: "The Ashen Court", Thronebound: "Mara", Homeworld: "Caelus", Concept: "A dispossessed Voidkin sovereign awakens a necromantic volcanic court linked to her stormbound homeworld." },
    { Theme: "Volcanic necromancy", Style: "Gothic basalt fortress", Description: "An ember-lit necropolis of carved basalt, graveglass vaults, black iron, funereal arches, and slow rivers of spectral fire.", Population: "Ashbound undead", "Population Appearance": "Masked skeletal figures veined with ember light and wrapped in black ceremonial cloth.", Manifestation: "Stone grows like cooling lava while spirits condense into disciplined servants and tools answer spoken command.", "Throne Room": "A vaulted basalt chamber surrounds a graveglass throne above a circular river of spectral flame." },
    { "Construction Name": "Graveglass", "Construction Description": "Black volcanic crystal that remembers imposed forms.", "Construction Collection": "Quarried from ossuary flows and condensed in controlled cooling beds.", "Construction Use": "Shapes rooms, fortifications, conduits, and structural fittings.", "Sustenance Name": "Cinder Marrow", "Sustenance Description": "Heat-rich spiritual biomass carrying stable death resonance.", "Sustenance Collection": "Rendered from char gardens and reclaimed spiritual residue.", "Sustenance Use": "Feeds and repairs the Court's manifested population.", "Development Name": "Sovereign Ichor", "Development Description": "Concentrated adaptive essence responsive to Dungeon bonds.", "Development Collection": "Refined from resonance shed during growth and training.", "Development Use": "Develops the Thronebound and bonded Administrators.", "Energy Name": "Pyreflow", "Energy Description": "Necromantic command energy circulating like controlled flame.", "Energy Collection": "Drawn through the throne from the Court's internal resonance.", "Energy Use": "Powers facilities, summoning, and Dungeon-linked development." },
    { Race: "Voidkin", Gender: "Woman", Appearance: "Mara is tall and ash-pale, with obsidian horns, ember eyes, dark ceremonial armor, and a mantle that sheds sparks when her authority gathers.", Personality: "Deliberate, protective, exacting, and slow to trust, but deeply loyal once a bond is accepted.", Background: "Mara was raised among Caelus's floating basalt kingdoms and trained to preserve a declining estate before the Dungeon bond drew her away.", Capabilities: "She is trained in ritual command, polearm combat, estate logistics, and the practical necromancy of her home culture.", Values: "She values sovereignty, competence, durable loyalty, and protecting those who accept her rule.", "Voice Pattern": "Mara speaks formally in concise declarative sentences and uses titles until trust is established." },
    { "Primary Name": "Cinder Sovereignty", "Primary Description": "The Court turns command, flame, and deathly resonance into coherent Dungeon authority.", "Primary Aptitude": "SSS", "Secondary Name": "Grave Resonance", "Secondary Description": "The Dungeon preserves and coordinates spiritual impressions through its structures and population.", "Secondary Aptitude": "A", "Tertiary Name": "N/A", "Tertiary Description": "N/A", "Tertiary Aptitude": "N/A" },
    { Might: "SSS", Agility: "A", Endurance: "S", Arcana: "B", Command: "SS", Logistics: "A", Insight: "S", Craft: "C" },
    { "Favored Attributes": "Might, Endurance, Command, Cinder Sovereignty" },
    { Description: "Caelus is a storm-wrapped world of floating basalt kingdoms, necromantic industry, windborne trade, and ritual technologies powered by captured lightning.", Region: "The Vesper Crown, a chain of fortress islands circling an immortal cyclone.", "Primary Anchor": "Mara's obsidian estate on the western edge of Vesper.", Residence: "A private tower apartment overlooking the estate's lightning gardens.", "Time Period": "The 312th Year of the Ashen Regency", "Current Circumstances": "The estate is politically isolated, its workforce diminished, and rival houses are probing its remaining claims." }
  ];
}
function snake(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }
function snakeFields(section) { return Object.fromEntries(Object.entries(section).map(([key, value]) => [snake(key), value])); }
function storyBibleOutput() {
  const [overview, dungeon, resources, thronebound, uniqueAttributes, aptitudes, growth, homeworld] = generatedSections();
  return { story_bible: {
    overview: { sexual_content: playerInput().sexualContent, kink_content: playerInput().kinkContent, ...snakeFields(overview) },
    [snake(overview.Dungeon)]: snakeFields(dungeon), dungeon_resources: snakeFields(resources), [snake(overview.Thronebound)]: snakeFields(thronebound),
    unique_attributes: snakeFields(uniqueAttributes), aptitudes: snakeFields(aptitudes), attribute_growth_preference: snakeFields(growth), homeworld: snakeFields(homeworld)
  } };
}
function initialization(overrides = {}) { return { ...DMS.parseInitializationJson(storyBibleOutput()), ...overrides }; }
function placeholders(value = storyBibleOutput()) { return [{ question: DMS.DMS_INITIALIZATION_QUESTION, answer: typeof value === "string" ? value : JSON.stringify(value) }]; }

test("the main scenario has one compact JSON handoff input matching the runtime", () => {
  const library = fs.readFileSync(path.join(__dirname, "..", "Library.js"), "utf8");
  assert.match(library.slice(0, 700), /Version: 0\.6\.0-dev[\s\S]*Runtime Schema: 11[\s\S]*Verified Dungeon Tiers: 0-1/);
  assert.equal(DMS.DMS_VERSION, "0.6.0-dev");
  const cards = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "DMS Scenario Setup Story Cards.json"), "utf8"));
  const setup = cards.find(card => card.keys === "DMS_SETUP_INITIALIZATION_JSON");
  assert.ok(setup.value.length <= 1000);
  assert.deepEqual([...setup.value.matchAll(/\$\{([^}]*)\}/g)].map(match => match[1]), [DMS.DMS_INITIALIZATION_QUESTION]);
  assert.equal(cards.filter(card => card.useForCharacterCreation).length, 1);
  assert.equal(cards.filter(card => card.keys.startsWith("DMS_SAVE_RESERVE_") && card.showInStoryCards === false).length, 64);
  assert.ok(cards.filter(card => card.keys.startsWith("DMS_FACILITY_UNLOCK_")).every(card => card.showInStoryCards === false && card.isSpoiler === true));
});

test("Dungeon Generator story_bible output adapts to the canonical DMS_INIT v2 object", () => {
  const result = initialization();
  assert.equal(result.format, "DMS_INIT");
  assert.equal(result.version, 2);
  assert.equal(result.homeworld.name, "Caelus");
  assert.deepEqual(result.dungeon.uniqueAttributes.map(attribute => attribute.priority), ["Primary", "Secondary"]);
  assert.deepEqual(result.overview.contentPolicy, { sexual: "Mature romantic content", kink: "None" });
  assert.deepEqual(result.thronebound.growthPreferences, ["Might", "Endurance", "Command", "Cinder Sovereignty"]);
  assert.doesNotThrow(() => DMS.parseInitializationJson(JSON.stringify(storyBibleOutput())));
});

test("Dungeon Generator exposes exactly four opening inputs and the authoritative Outline card", () => {
  const opening = fs.readFileSync(path.join(__dirname, "..", "dungeon-generator", "Opening.txt"), "utf8");
  const cards = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "dungeon-generator", "Dungeon Generator Story Cards.json"), "utf8"));
  const outline = cards.find(card => card.title === "Outline").value;
  assert.equal([...opening.matchAll(/\$\{([^}]*)\}/g)].length, 4);
  assert.deepEqual(cards.map(card => card.title), ["Configure Generator", "Outline"]);
  assert.match(outline, /Overview[\s\S]*Dungeon Template[\s\S]*Dungeon Resources[\s\S]*Character Template[\s\S]*Unique Attributes[\s\S]*Aptitudes[\s\S]*Attribute Growth Preference[\s\S]*Homeworld/);
  assert.doesNotMatch(outline, /one- or two-word/);
  assert.match(outline, /The Daughters of the Veil/);
  assert.match(outline, /primary Dungeon currency used throughout construction, facility operation and upgrades, summoning, training, research, portals, and Dungeon advancement/);
  assert.match(outline, /must not duplicate Might, Agility, Endurance, Arcana, Command, Logistics, Insight, or Craft/);
});

test("the original Scenario Generator remains outline-driven and emits story_bible JSON", () => {
  const generator = fs.readFileSync(path.join(__dirname, "..", "dungeon-generator", "Library.js"), "utf8");
  assert.match(generator, /title === "Outline"/);
  assert.match(generator, /\{story_bible: state\.parsedContext\}/);
  assert.match(generator, /const filters = \["\/\/", "> ⛔ Error"\]/);
  assert.match(generator, /Population is the collective name the Thronebound uses for all Dungeonbound denizens/);
  assert.match(generator, /Construction pays for facilities, Expansion, Tier Ups/);
  assert.match(generator, /Dungeon Energy is the ungraded primary Dungeon currency/);
  assert.match(generator, /standard Attributes already cover Might, Agility, Endurance, Arcana, Command, Logistics, Insight, and Craft/);
});

test("the adapter removes generator guidance accidentally appended to a field", () => {
  const generated = storyBibleOutput();
  generated.story_bible.mara.voice_pattern += "// The Primary Unique Attribute is required.// This guidance is not character canon.";
  const first = DMS.parseInitializationJson(generated), retry = DMS.parseInitializationJson(JSON.stringify(generated));
  assert.equal(first.thronebound.voicePattern, generatedSections()[3]["Voice Pattern"]);
  assert.deepEqual(retry, first);
});

test("the JSON adapter atomically initializes complete Tier 0 state and narrative canon", () => {
  const dms = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders()), true);
  assert.equal(DMS.identityReady(dms), true);
  assert.equal(dms.thronebound.name, "Mara");
  assert.equal(dms.thronebound.profile.gender, "Woman");
  assert.equal(dms.dungeon.name, "The Ashen Court");
  assert.equal(dms.dungeon.lore.throneRoom, generatedSections()[1]["Throne Room"]);
  assert.equal(dms.rooms["room-throne"].lore.appearance, generatedSections()[1]["Throne Room"]);
  assert.equal(dms.population.nature, "Ashbound undead");
  assert.equal(dms.world.homeworldAnchor, "Mara's obsidian estate on the western edge of Vesper.");
  assert.equal(dms.world.homeworldResidence, "A private tower apartment overlooking the estate's lightning gardens.");
  assert.equal(dms.dungeon.resources.construction.name, "Graveglass");
  assert.equal(dms.thronebound.attributes.combat.Might.aptitude, "SSS");
  assert.deepEqual(dms.thronebound.growthPreferences, ["Might", "Endurance", "Command", "Cinder Sovereignty"]);
  assert.equal(dms.dungeon.uniqueAttributes["Cinder Sovereignty"].priority, "Primary");
  assert.equal(dms.thronebound.attributes.unique, undefined);
  assert.deepEqual(Object.keys(dms.rooms), ["room-throne"]);
});

test("Thronebound Level Ups grow only Combat and Support Attributes", () => {
  const favored = DMS.defaultState(), baseline = DMS.defaultState();
  for (const dms of [favored, baseline]) {
    dms.thronebound.name = "Mara"; dms.dungeon.name = "The Ashen Court"; dms.thronebound.level = 2;
    for (const group of ["combat", "support"]) for (const attribute of Object.values(dms.thronebound.attributes[group])) attribute.aptitude = "F";
    dms.dungeon.uniqueAttributes = { "Cinder Sovereignty": { aptitude: "SSS", value: 3, description: "Theme power.", priority: "Primary" } };
  }
  favored.thronebound.growthPreferences = ["Might", "Endurance", "Command", "Insight"];
  const before = favored.dungeon.uniqueAttributes["Cinder Sovereignty"].value;
  const favoredGains = DMS.growAttributes(favored), baselineGains = DMS.growAttributes(baseline);
  assert.deepEqual(Object.keys(favoredGains).sort(), DMS.aptitudeNames(favored).sort());
  for (const name of Object.keys(favoredGains)) assert.equal(favoredGains[name], baselineGains[name] + (favored.thronebound.growthPreferences.includes(name) ? 1 : 0));
  assert.equal(favored.dungeon.uniqueAttributes["Cinder Sovereignty"].value, before);
});

test("Unique Dungeon Attributes grow at Dungeon Tier Up and favored ones gain a bonus", () => {
  const favored = DMS.defaultState(), baseline = DMS.defaultState();
  DMS.initializeFromScenarioVariables(favored, placeholders()); DMS.initializeFromScenarioVariables(baseline, placeholders());
  baseline.thronebound.growthPreferences = baseline.thronebound.growthPreferences.filter(name => name !== "Cinder Sovereignty");
  favored.dungeon.tier = 1; baseline.dungeon.tier = 1;
  const favoredGains = DMS.growDungeonAttributes(favored), baselineGains = DMS.growDungeonAttributes(baseline);
  assert.equal(favoredGains["Cinder Sovereignty"], baselineGains["Cinder Sovereignty"] + 1);
  assert.ok(DMS.dungeonAttributeMultiplier(favored) > 1);
  favored.dungeon.tier = 0; favored.activity.mode = "System"; favored.activity.pace = "Timeless";
  const manager = DMS.summonAdministrator(favored, "Veyra"), base = manager.effectiveness;
  assert.ok(DMS.administratorAssignmentEffectiveness(favored, manager) > base);
  favored.population.soldiers.cohorts = [{ id: "soldiers-1", archetype: "Guardian", count: 2, tier: 1 }];
  assert.ok(DMS.defensePower(favored) > 7);
});

test("initialization is retry-safe and malformed JSON cannot partially mutate state", () => {
  const dms = DMS.defaultState();
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders()), true);
  const revision = dms.persistence.revision, signature = dms.onboarding.scenarioVariableSignature;
  const retry = initialization(); retry.thronebound.name = "Retry Name";
  assert.equal(DMS.initializeFromScenarioVariables(dms, placeholders(retry)), false);
  assert.equal(dms.thronebound.name, "Mara");
  assert.equal(dms.persistence.revision, revision);
  assert.equal(dms.onboarding.scenarioVariableSignature, signature);
  const malformed = DMS.defaultState();
  assert.throws(() => DMS.initializeFromScenarioVariables(malformed, placeholders('{"format":"DMS_INIT"}')), /version must be 1 or 2/i);
  assert.equal(malformed.dungeon.name, "Unnamed Dungeon");
  assert.equal(malformed.persistence.revision, 0);
});

test("Plot Essentials and compact lore cards expose readable generated state", () => {
  global.storyCards.length = 0;
  const dms = DMS.defaultState(); DMS.initializeFromScenarioVariables(dms, placeholders());
  global.state = { memory: { context: "Keep this plot fact.", authorsNote: "Write in close second person." } };
  assert.equal(DMS.syncScenarioPlot(dms), true); DMS.refreshCards(dms);
  assert.match(global.state.memory.context, /THRONEBOUND STATUS\nName: Mara\nRace: Voidkin/);
  assert.match(global.state.memory.context, /DUNGEON STATUS\nName: The Ashen Court\nTier: 0/);
  assert.match(global.state.memory.context, /Unique Attributes: Primary — Cinder Sovereignty \[SSS\]: 1/);
  assert.doesNotMatch(global.state.memory.context, /\$\{/);
  assert.ok(DMS.plotEssentialsText(dms).length <= 1800);
  assert.match(global.state.memory.authorsNote, /\[DMS ACTIVITY STATE\]/);
  for (const key of ["DMS_LORE_SCENARIO_GUIDANCE", "DMS_LORE_DUNGEON_FOUNDATION", "DMS_LORE_THRONEBOUND_IDENTITY", "DMS_LORE_THRONEBOUND_CHARACTER", "DMS_LORE_HOMEWORLD_FOUNDATION", "DMS_LORE_HOMEWORLD_ANCHOR"]) {
    const card = global.storyCards.find(item => String(item.keys).includes(key)); assert.ok(card, `${key} was not created`); assert.ok(card.entry.length <= 2000, `${key} exceeds 2,000 characters`);
  }
});

test("initialization canon, Dungeon Attributes, affinity, and Throne Room survive recovery", () => {
  global.storyCards.length = 0;
  const dms = DMS.defaultState(); DMS.initializeFromScenarioVariables(dms, placeholders());
  dms.activity.mode = "System"; dms.activity.pace = "Timeless"; const manager = DMS.summonAdministrator(dms, "Veyra");
  DMS.refreshCards(dms); DMS.writeSaveCards(dms);
  const loaded = DMS.loadSaveCards(undefined, DMS.readSaveCards());
  assert.equal(loaded.onboarding.scenarioVariablesImported, true);
  assert.deepEqual(loaded.dungeon.uniqueAttributes, dms.dungeon.uniqueAttributes);
  assert.equal(loaded.administrators[manager.id].dungeonAttributeAffinity, manager.dungeonAttributeAffinity);
  assert.equal(loaded.thronebound.profile.background, dms.thronebound.profile.background);
  assert.equal(loaded.rooms["room-throne"].lore.appearance, generatedSections()[1]["Throne Room"]);
});

test("schema migration relocates legacy Thronebound Unique Attributes to priority mechanics", () => {
  const legacy = DMS.normalize({ dungeon: { theme: "Verdant clockwork" }, thronebound: { attributes: { unique: { Chronoflora: { description: "Living time rooted in brass vines.", aptitude: "S", value: 7 } } } } }, { updateQuests: false });
  assert.equal(legacy.thronebound.attributes.unique, undefined);
  assert.equal(legacy.dungeon.uniqueAttributes.Chronoflora.value, 7);
  assert.equal(legacy.dungeon.uniqueAttributes.Chronoflora.priority, "Primary");
  assert.equal(Object.keys(legacy.dungeon.uniqueAttributes).length, 1);
});

test("the v2 adapter continues to accept a complete legacy v1 initialization", () => {
  const current = initialization(), legacy = {
    format: "DMS_INIT", version: 1,
    thronebound: { name: current.thronebound.name, race: current.thronebound.race, aptitudes: current.thronebound.aptitudes, growthPreferences: ["Might", "Endurance", "Command"] },
    dungeon: { name: current.dungeon.name, theme: current.dungeon.theme, style: current.dungeon.style, population: current.dungeon.population, resources: current.dungeon.resources, uniqueAttributes: current.dungeon.uniqueAttributes.map((attribute, index) => ({ name: attribute.name, description: attribute.description, aptitude: attribute.aptitude, value: attribute.value, domain: DMS.LEGACY_DUNGEON_ATTRIBUTE_DOMAINS[index] })) },
    homeworld: { name: current.homeworld.name, description: current.homeworld.description, anchor: current.homeworld.anchor, secondaryLocation: current.homeworld.region }
  };
  const parsed = DMS.parseInitializationJson(JSON.stringify(legacy));
  assert.equal(parsed.version, 2);
  assert.deepEqual(parsed.dungeon.uniqueAttributes.map(attribute => attribute.priority), ["Primary", "Secondary"]);
});
