const fs = require('node:fs');
const path = require('node:path');

const file = path.join(process.cwd(), 'Library.js');
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(search, replacement, label) {
  const before = source;
  source = source.replace(search, replacement);
  if (source === before) throw new Error(`Patch target not found: ${label}`);
}

replaceOnce('  const SCHEMA = 3;\n', '  const SCHEMA = 4;\n  const SAVE_SCHEMA = 1;\n  const SAVE_CARD_PREFIX = "DMS Save — ";\n  const SAVE_CARD_TITLES = Object.freeze({ core: `${SAVE_CARD_PREFIX}Core`, progression: `${SAVE_CARD_PREFIX}Progression`, operations: `${SAVE_CARD_PREFIX}Operations`, world: `${SAVE_CARD_PREFIX}World` });\n', 'schema constants');

replaceOnce(
  '      generation: { roomSequence: 0, administratorSequence: 0, sectorSequence: 0, previewSequence: 0 }, log: []\n',
  '      generation: { roomSequence: 0, administratorSequence: 0, sectorSequence: 0, previewSequence: 0 },\n      persistence: { saveSchema: SAVE_SCHEMA, revision: 0, cacheRevision: 0, lastSavedRevision: 0 },\n      resourceTransactions: [], log: []\n',
  'default persistence state'
);

replaceOnce(
  '      generation: { ...base.generation, ...(value.generation || {}) }, classPreviews: value.classPreviews || {}, shops: { ...base.shops, ...(value.shops || {}) }, tasks: Array.isArray(value.tasks) ? value.tasks : [],\n',
  '      generation: { ...base.generation, ...(value.generation || {}) }, persistence: { ...base.persistence, ...(value.persistence || {}) }, resourceTransactions: Array.isArray(value.resourceTransactions) ? value.resourceTransactions.slice(-50) : [], classPreviews: value.classPreviews || {}, shops: { ...base.shops, ...(value.shops || {}) }, tasks: Array.isArray(value.tasks) ? value.tasks : [],\n',
  'normalize persistence merge'
);

replaceOnce(
  '    dms.thronebound.experience = Number(dms.thronebound.experience) || 0;\n    applyDerivedState(dms);\n',
  `    dms.thronebound.experience = Number(dms.thronebound.experience) || 0;
    dms.persistence.saveSchema = SAVE_SCHEMA;
    dms.persistence.revision = Math.max(0, Number(dms.persistence.revision) || 0);
    dms.persistence.cacheRevision = Math.max(0, Number(dms.persistence.cacheRevision) || dms.persistence.revision);
    const maxSuffix = (values, pattern) => values.reduce((max, value) => Math.max(max, Number(String(value).match(pattern)?.[1]) || 0), 0);
    dms.generation.roomSequence = Math.max(Number(dms.generation.roomSequence) || 0, maxSuffix(Object.keys(dms.rooms), /^room-(\\d+)$/));
    dms.generation.administratorSequence = Math.max(Number(dms.generation.administratorSequence) || 0, maxSuffix(Object.keys(dms.administrators), /^administrator-(\\d+)$/));
    dms.generation.sectorSequence = Math.max(Number(dms.generation.sectorSequence) || 0, maxSuffix(Object.keys(dms.world.lustria.sectors || {}), /^sector-(\\d+)$/));
    applyDerivedState(dms);
`,
  'normalize schema repair'
);

replaceOnce(
  '  function record(dms, message) { dms.log.push({ cycle: dms.activity.cycle, location: dms.activity.location.major, message: clean(message) }); dms.log = dms.log.slice(-100); }\n',
  `  function markStateChanged(dms) {
    dms.persistence ||= { saveSchema: SAVE_SCHEMA, revision: 0, cacheRevision: 0, lastSavedRevision: 0 };
    dms.persistence.revision = Math.max(Number(dms.persistence.revision) || 0, Number(dms.persistence.cacheRevision) || 0) + 1;
    dms.persistence.cacheRevision = dms.persistence.revision;
    return dms.persistence.revision;
  }
  function record(dms, message) { dms.log.push({ cycle: dms.activity.cycle, location: dms.activity.location.major, message: clean(message) }); dms.log = dms.log.slice(-100); markStateChanged(dms); }
`,
  'revision tracking'
);

replaceOnce(
  /  function spend\(dms, costs\) \{[\s\S]*?\n  \}\n  function assignmentCount/,
  `  function transactResources(dms, deltas, context = "transaction") {
    const normalized = {};
    for (const [rawRole, rawAmount] of Object.entries(deltas || {})) {
      const role = clean(rawRole).toLowerCase();
      if (!RESOURCE_ROLES.includes(role)) throw new Error(\`Unknown dungeon resource role: \${rawRole}.\`);
      const delta = Number(rawAmount) || 0;
      const current = Number(dms.dungeon.resources[role]?.amount) || 0;
      if (current + delta < -1e-9) throw new Error(\`Requires \${Math.abs(delta)} \${dms.dungeon.resources[role]?.name || role}.\`);
      normalized[role] = delta;
    }
    const changes = {};
    for (const [role, delta] of Object.entries(normalized)) {
      if (!delta) continue;
      const resource = dms.dungeon.resources[role], before = Number(resource.amount) || 0;
      resource.amount = Number((before + delta).toFixed(4));
      changes[role] = { before, delta, after: resource.amount };
    }
    if (Object.keys(changes).length) {
      dms.resourceTransactions ||= [];
      dms.resourceTransactions.push({ revision: markStateChanged(dms), cycle: dms.activity.cycle, context: clean(context), changes });
      dms.resourceTransactions = dms.resourceTransactions.slice(-50);
    }
    return changes;
  }
  function spend(dms, costs, context = "spend") { return transactResources(dms, Object.fromEntries(Object.entries(costs || {}).map(([role, amount]) => [role, -Math.abs(Number(amount) || 0)])), context); }
  function rewardResources(dms, rewards, context = "reward") { return transactResources(dms, Object.fromEntries(Object.entries(rewards || {}).filter(([role]) => RESOURCE_ROLES.includes(role)).map(([role, amount]) => [role, Math.max(0, Number(amount) || 0)])), context); }
  function resourceStorage(dms) {
    const multiplier = 1 + Object.values(dms.rooms).filter(room => room.state === "Active").reduce((sum, room) => sum + (ROOM_DEFINITIONS[room.definition]?.storageMultiplier || 0) * room.tier, 0);
    return { enabled: dms.dungeon.tier >= 4, multiplier: Number(multiplier.toFixed(2)), amounts: Object.fromEntries(RESOURCE_ROLES.map(role => [role, Number(dms.dungeon.resources[role].amount) || 0])) };
  }
  function assignmentCount`,
  'resource transaction layer'
);

replaceOnce(
  '    if (!attribute) throw new Error("Unknown Thronebound Attribute."); attribute.aptitude = aptitude; attribute.preference = clamp(Math.floor(preference), 1, 5); return attribute;\n',
  '    if (!attribute) throw new Error("Unknown Thronebound Attribute."); attribute.aptitude = aptitude; attribute.preference = clamp(Math.floor(preference), 1, 5); record(dms, `Configured ${attributeName} Aptitude ${aptitude}.`); return attribute;\n',
  'aptitude persistence'
);
replaceOnce(
  '    dms.thronebound.attributes.unique[clean(name)] = { value: clamp(value, 0, 100000), description: clean(description) }; return dms.thronebound.attributes.unique[name];\n',
  '    dms.thronebound.attributes.unique[clean(name)] = { value: clamp(value, 0, 100000), description: clean(description) }; record(dms, `Defined Unique Attribute ${clean(name)}.`); return dms.thronebound.attributes.unique[clean(name)];\n',
  'unique attribute persistence'
);
replaceOnce(
  '    dms.activity.mode = canonicalMode; dms.activity.targets = unique(targets); dms.activity.pace = canonicalPace; return dms.activity;\n',
  '    dms.activity.mode = canonicalMode; dms.activity.targets = unique(targets); dms.activity.pace = canonicalPace; record(dms, `Activity changed to ${canonicalMode} / ${canonicalPace}.`); return dms.activity;\n',
  'activity persistence'
);
replaceOnce(
  '    const scoutPower = Object.values(dms.rooms).reduce((sum, room) => sum + (ROOM_DEFINITIONS[room.definition]?.scoutPower || 0) * room.tier, 0);\n',
  '    const scoutPower = Object.values(dms.rooms).filter(room => room.state === "Active").reduce((sum, room) => sum + (ROOM_DEFINITIONS[room.definition]?.scoutPower || 0) * room.tier, 0);\n',
  'active scout effect'
);
replaceOnce(
  '    if (!room || room.definition !== "vein-extractor") throw new Error("Targeting requires a Vein Extraction Facility.");\n',
  '    if (!room || room.definition !== "vein-extractor" || room.state !== "Active") throw new Error("Targeting requires an active Vein Extraction Facility.");\n',
  'active extractor effect'
);
replaceOnce(
  '    if (conquest && !Object.values(dms.rooms).some(room => room.definition === "conquest-command")) throw new Error("Conquest requires the Tier 8 Conquest Command room.");\n',
  '    if (conquest && !Object.values(dms.rooms).some(room => room.definition === "conquest-command" && room.state === "Active")) throw new Error("Conquest requires an active Tier 8 Conquest Command room.");\n',
  'active conquest effect'
);


replaceOnce(
  '        dms.dungeon.resources[definition.resource].amount += amount; report.dungeonResources[definition.resource] = (report.dungeonResources[definition.resource] || 0) + amount;\n',
  '        rewardResources(dms, { [definition.resource]: amount }, `production:${room.id}`); report.dungeonResources[definition.resource] = (report.dungeonResources[definition.resource] || 0) + amount;\n',
  'cycle production transaction'
);
replaceOnce(
  '    dms.dungeon.resources.sustenance.amount = Math.max(0, dms.dungeon.resources.sustenance.amount - report.upkeep);\n',
  '    const payableUpkeep = Math.min(report.upkeep, dms.dungeon.resources.sustenance.amount); if (payableUpkeep) spend(dms, { sustenance: payableUpkeep }, "cycle-upkeep"); report.unpaidUpkeep = Number((report.upkeep - payableUpkeep).toFixed(2));\n',
  'cycle upkeep transaction'
);
replaceOnce(
  '    else if (dms.activity.mode === "Production" && /\\b(?:help|work|assist|produce|collect)\\b/i.test(words)) { dms.dungeon.resources.energy.amount += 1; benefit.note = "The Thronebound\'s direct assistance added 1 dungeon energy."; }\n',
  '    else if (dms.activity.mode === "Production" && /\\b(?:help|work|assist|produce|collect)\\b/i.test(words)) { rewardResources(dms, { energy: 1 }, "activity-production"); benefit.note = "The Thronebound\'s direct assistance added 1 dungeon energy."; }\n',
  'activity production transaction'
);
replaceOnce(
  '      if (task) { const craft = dms.thronebound.attributes.support.Craft?.value || 1, logistics = dms.thronebound.attributes.support.Logistics?.value || 1, reduction = Math.max(1, Math.floor((craft + logistics) / 20)); task.remaining = Math.max(1, task.remaining - reduction); benefit.task = task.id; benefit.note = `Direct construction assistance reduced ${task.id} by ${reduction} Cycle(s).`; }\n',
  '      if (task) { const craft = dms.thronebound.attributes.support.Craft?.value || 1, logistics = dms.thronebound.attributes.support.Logistics?.value || 1, reduction = Math.max(1, Math.floor((craft + logistics) / 20)); const before = task.remaining; task.remaining = Math.max(1, task.remaining - reduction); if (task.remaining !== before) record(dms, `Direct construction assistance reduced ${task.id} by ${before - task.remaining} Cycle(s).`); benefit.task = task.id; benefit.note = `Direct construction assistance reduced ${task.id} by ${reduction} Cycle(s).`; }\n',
  'construction activity persistence'
);

replaceOnce(
  '    for (const role of RESOURCE_ROLES) dms.dungeon.resources[role].amount += Number(rewards[role] || 0);\n',
  '    rewardResources(dms, rewards, `quest:${quest.title}`);\n',
  'quest reward transaction'
);
replaceOnce(
  '    const id = `${category.toLowerCase()}-${stableNumber(`${titleText}|${Object.keys(dms.quests.records).length}`).toString(36)}`;\n    dms.quests.records[id] = { category, title: clean(titleText), objective: clean(objective), tier: dms.dungeon.tier, status: "active", rewards: { experience: 50 * Math.max(1, dms.dungeon.tier), energy: 10 * Math.max(1, dms.dungeon.tier), ...rewards } }; return dms.quests.records[id];\n',
  '    const seed = `${category}|${clean(titleText)}|${clean(objective)}`, id = `${category.toLowerCase()}-${stableNumber(seed).toString(36)}`;\n    if (dms.quests.records[id]) return dms.quests.records[id];\n    dms.quests.records[id] = { category, title: clean(titleText), objective: clean(objective), tier: dms.dungeon.tier, status: "active", prerequisites: [], rewards: { experience: 50 * Math.max(1, dms.dungeon.tier), energy: 10 * Math.max(1, dms.dungeon.tier), ...rewards } }; record(dms, `Created ${category} Quest: ${clean(titleText)}.`); return dms.quests.records[id];\n',
  'deterministic quest IDs'
);

const persistenceHelpers = String.raw`
  function saveCardByTitle(titleText) { return Array.isArray(global.storyCards) ? global.storyCards.find(card => card.title === titleText) : null; }
  function savePayload(card) {
    if (!card?.entry) return null;
    try { const value = JSON.parse(card.entry); return value && value.sv === SAVE_SCHEMA && Number.isFinite(Number(value.rev)) ? value : null; } catch { return null; }
  }
  function compactCoreSave(dms) {
    return { sv: SAVE_SCHEMA, rev: dms.persistence.revision, schema: dms.schema, tier: dms.dungeon.tier, cycle: dms.activity.cycle, progress: dms.activity.progress, res: Object.fromEntries(RESOURCE_ROLES.map(role => [role, dms.dungeon.resources[role].amount])), gen: dms.generation, activity: { mode: dms.activity.mode, pace: dms.activity.pace, targets: dms.activity.targets, location: dms.activity.location, lastTurnKey: dms.activity.lastTurnKey || "" } };
  }
  function compactProgressionSave(dms) {
    const attrs = Object.fromEntries(["combat", "support"].map(group => [group, Object.fromEntries(Object.entries(dms.thronebound.attributes[group] || {}).map(([name, value]) => [name, { value: value.value, aptitude: value.aptitude, preference: value.preference }]))]));
    const abilities = list => list.map(item => [item.name, item.mastery || 0, item.grade || 1, item.gradeName || "Basic", item.tier || 1]);
    return { sv: SAVE_SCHEMA, rev: dms.persistence.revision, tb: { level: dms.thronebound.level, xp: dms.thronebound.experience, attrs, unique: dms.thronebound.attributes.unique, classTier: dms.thronebound.class.tier, skills: abilities(dms.thronebound.class.skills), traits: abilities(dms.thronebound.class.traits) }, admins: Object.fromEntries(Object.entries(dms.administrators).map(([id, a]) => [id, { level: a.level, xp: a.experience, role: a.role, rank: a.rank, effectiveness: a.effectiveness, specialization: a.attributeSpecialization, bond: a.bond, assignedRooms: a.assignedRooms, classTier: a.class?.tier || 0 }])), quests: Object.fromEntries(Object.entries(dms.quests.records).map(([id, q]) => [id, { status: q.status, rewarded: !!q.rewarded, tier: q.tier, category: q.category, prerequisites: q.prerequisites || [] }])) };
  }
  function compactOperationsSave(dms) {
    return { sv: SAVE_SCHEMA, rev: dms.persistence.revision, rooms: Object.fromEntries(Object.entries(dms.rooms).map(([id, room]) => [id, { definition: room.definition, tier: room.tier, expansion: room.expansion || 1, state: room.state, assignedAdministrator: room.assignedAdministrator || "", targetedVeins: room.targetedVeins || [] }])), tasks: dms.tasks, soldiers: dms.population.soldiers.cohorts, research: dms.shops.research };
  }
  function compactWorldSave(dms) { return { sv: SAVE_SCHEMA, rev: dms.persistence.revision, lustria: { sectors: dms.world.lustria.sectors, veins: dms.world.lustria.veins, inventory: dms.world.lustria.inventory, controlledSectors: dms.world.lustria.controlledSectors } }; }
  function writeSaveCards(dms) {
    if (!Array.isArray(global.storyCards)) return false;
    const payloads = { core: compactCoreSave(dms), progression: compactProgressionSave(dms), operations: compactOperationsSave(dms), world: compactWorldSave(dms) };
    for (const [key, payload] of Object.entries(payloads)) { const card = ensureCard(SAVE_CARD_TITLES[key], \`DMS_SAVE_\${key.toUpperCase()}\`); card.type = "System — DMS Save"; card.description = \`Compact DMS mechanical save; revision \${dms.persistence.revision}. Ordinary Story Cards remain authoritative for lore.\`; card.entry = JSON.stringify(payload); }
    dms.persistence.lastSavedRevision = dms.persistence.revision; dms.persistence.cacheRevision = dms.persistence.revision; return true;
  }
  function readSaveCards() {
    if (!Array.isArray(global.storyCards)) return null;
    const values = Object.fromEntries(Object.entries(SAVE_CARD_TITLES).map(([key, titleText]) => [key, savePayload(saveCardByTitle(titleText))]));
    if (!values.core) return null;
    const rev = Number(values.core.rev);
    for (const value of Object.values(values)) if (value && Number(value.rev) !== rev) return null;
    return { revision: rev, ...values };
  }
  function cardField(card, label) { return clean(String(card?.entry || "").match(new RegExp("^" + label + ":\\s*(.+)$", "im"))?.[1]); }
  function hydrateIdentityFromCards(dms) {
    const dungeon = saveCardByTitle("DMS — Dungeon");
    const dungeonLine = String(dungeon?.entry || "").match(/^Dungeon:\s*(.+?)\s*\|\s*Tier/im); if (dungeonLine) dms.dungeon.name = clean(dungeonLine[1]);
    const identity = String(dungeon?.entry || "").match(/^Identity:\s*(.+?)\s*\/\s*(.+)$/im); if (identity) { dms.dungeon.theme = clean(identity[1]); dms.dungeon.style = clean(identity[2]); }
    const throne = saveCardByTitle("DMS — Thronebound"), first = String(throne?.entry || "").split("\n")[0].split(/\s+[—-]\s+/); if (first.length >= 2) { dms.thronebound.name = clean(first[0]); dms.thronebound.race = clean(first.slice(1).join(" — ")); }
    const worldIdentity = saveCardByTitle("DMS — Identity"); if (worldIdentity) { dms.population.workerDescription = cardField(worldIdentity, "Workers") || dms.population.workerDescription; dms.population.soldierDescription = cardField(worldIdentity, "Soldiers") || dms.population.soldierDescription; dms.world.homeworld = cardField(worldIdentity, "Homeworld") || dms.world.homeworld; dms.world.secondaryLocation = cardField(worldIdentity, "Secondary") || dms.world.secondaryLocation; }
    const resources = saveCardByTitle("DMS — Dungeon Resources");
    for (const role of RESOURCE_ROLES) { const block = String(resources?.entry || "").match(new RegExp(\`\\[\${title(role)}\\] ([^:]+): ([^\\n]*)\\nCollection: ([^\\n]*)\\nUse: ([^\\n]*)\`, "i")); if (block) dms.dungeon.resources[role] = { ...dms.dungeon.resources[role], role, name: clean(block[1]), description: clean(block[2]), collection: clean(block[3]), use: clean(block[4]) }; }
    return dms;
  }
  function loadSaveCards(candidate, snapshot = readSaveCards()) {
    if (!snapshot?.core) throw new Error("No valid DMS Save cards were found.");
    const dms = hydrateIdentityFromCards(normalize(candidate || defaultState()));
    const core = snapshot.core, progression = snapshot.progression || {}, operations = snapshot.operations || {}, world = snapshot.world || {};
    dms.dungeon.tier = clamp(core.tier, 0, 10); dms.activity.cycle = Math.max(0, Number(core.cycle) || 0); dms.activity.progress = clamp(core.progress, 0, 0.999999);
    for (const role of RESOURCE_ROLES) if (Number.isFinite(Number(core.res?.[role]))) dms.dungeon.resources[role].amount = Number(core.res[role]);
    dms.generation = { ...dms.generation, ...(core.gen || {}) }; if (core.activity) dms.activity = { ...dms.activity, ...core.activity, location: { ...dms.activity.location, ...(core.activity.location || {}) } };
    const tb = progression.tb || {}; dms.thronebound.level = Math.max(1, Number(tb.level) || dms.thronebound.level); dms.thronebound.experience = Math.max(0, Number(tb.xp) || 0); dms.thronebound.class.tier = Math.max(0, Number(tb.classTier) || 0); dms.thronebound.attributes.unique = tb.unique || dms.thronebound.attributes.unique;
    for (const group of ["combat", "support"]) for (const [name, value] of Object.entries(tb.attrs?.[group] || {})) if (dms.thronebound.attributes[group]?.[name]) dms.thronebound.attributes[group][name] = { ...dms.thronebound.attributes[group][name], ...value };
    dms.rooms = {}; for (const [id, saved] of Object.entries(operations.rooms || {})) { const definition = ROOM_DEFINITIONS[saved.definition]; if (!definition) continue; dms.rooms[id] = { id, definition: saved.definition, name: definition.name, tier: Math.max(1, Number(saved.tier) || definition.unlockTier || 1), expansion: Math.max(1, Number(saved.expansion) || 1), state: saved.state || "Active", assignedWorkers: 0, jobPopulation: 0, targetedVeins: Array.isArray(saved.targetedVeins) ? saved.targetedVeins : [], assignedAdministrator: saved.assignedAdministrator || "", lore: roomLore(dms, definition, Math.max(1, Number(saved.tier) || definition.unlockTier || 1)) }; }
    dms.tasks = Array.isArray(operations.tasks) ? operations.tasks : []; dms.population.soldiers.cohorts = Array.isArray(operations.soldiers) ? operations.soldiers : []; dms.shops.research = operations.research || {};
    dms.world.lustria = { ...dms.world.lustria, ...(world.lustria || {}) };
    for (const [id, saved] of Object.entries(progression.quests || {})) { if (dms.quests.records[id]) Object.assign(dms.quests.records[id], saved); else { const card = Array.isArray(global.storyCards) ? global.storyCards.find(item => clean(item.keys).split(",").includes(\`DMS_QUEST_\${id.toUpperCase().replace(/\\W/g, "_")}\`)) : null; dms.quests.records[id] = { category: saved.category || "Personal", tier: saved.tier ?? dms.dungeon.tier, title: clean(String(card?.title || "").replace(/^DMS Quest — /, "")) || id, status: saved.status || "locked", objective: cardField(card, "Objective"), rewards: (() => { try { return JSON.parse(cardField(card, "Rewards") || "{}"); } catch { return {}; } })(), prerequisites: saved.prerequisites || [], rewarded: !!saved.rewarded }; } }
    dms.administrators = {}; for (const [id, saved] of Object.entries(progression.admins || {})) { const card = Array.isArray(global.storyCards) ? global.storyCards.find(item => clean(item.keys).split(",").includes(\`DMS_ADMIN_\${id.toUpperCase().replace(/\\W/g, "_")}\`)) : null; const line = String(card?.entry || "").split("\n")[0].split(/\s+[—-]\s+/), admin = characterBase(clean(line[0]) || id, clean(line.slice(1).join(" — ")) || dms.population.workerDescription, saved.role || "Manager"); admin.id = id; admin.role = saved.role || "Manager"; admin.rank = saved.rank || "F"; admin.effectiveness = Number(saved.effectiveness) || ADMINISTRATOR_RANK_MULTIPLIERS[admin.rank] || 1; admin.attributeSpecialization = saved.specialization || "support"; admin.attributes = { [admin.attributeSpecialization]: attributeSet(ATTRIBUTE_TEMPLATES[admin.attributeSpecialization]) }; admin.level = Math.max(1, Number(saved.level) || 1); admin.experience = Math.max(0, Number(saved.xp) || 0); admin.bond = saved.bond || { value: 0, completedEvents: [] }; admin.assignedRooms = saved.assignedRooms || []; admin.class.tier = Math.max(0, Number(saved.classTier) || 0); admin.status = "Active"; dms.administrators[id] = admin; }
    dms.persistence = { saveSchema: SAVE_SCHEMA, revision: snapshot.revision, cacheRevision: snapshot.revision, lastSavedRevision: snapshot.revision };
    dms.initialized = identityReady(dms); applyDerivedState(dms); updateQuests(dms); dms.persistence.revision = snapshot.revision; dms.persistence.cacheRevision = snapshot.revision; return dms;
  }
`.replace(/\\`/g, "`").replace(/\\\$\{/g, "${");
replaceOnce('  function ensureCard(titleText, keys = "") {\n', persistenceHelpers + '\n  function ensureCard(titleText, keys = "") {\n', 'persistence helpers');

replaceOnce(
  '    let card = global.storyCards.find(candidate => candidate.title === titleText);\n    if (!card) { card = { title: titleText, keys, entry: "", type: "System Cards", description: "Managed by the Dungeon Management System." }; global.storyCards.push(card); }\n',
  '    const matches = global.storyCards.filter(candidate => candidate.title === titleText); let card = matches[0]; if (matches.length > 1) for (let index = global.storyCards.length - 1; index >= 0; index--) if (global.storyCards[index].title === titleText && global.storyCards[index] !== card) global.storyCards.splice(index, 1);\n    if (!card) { card = { title: titleText, keys, entry: "", type: "System Cards", description: "Managed by the Dungeon Management System." }; global.storyCards.push(card); }\n',
  'story card dedupe'
);
replaceOnce(
  '    const dungeonCard = ensureCard("DMS — Dungeon", "DMS_SYS_DUNGEON_STATUS"); if (dungeonCard) dungeonCard.entry = status(dms);\n',
  '    const dungeonCard = ensureCard("DMS — Dungeon", "DMS_SYS_DUNGEON_STATUS"); if (dungeonCard) dungeonCard.entry = status(dms);\n    const identityCard = ensureCard("DMS — Identity", "DMS_SYS_IDENTITY"); if (identityCard) identityCard.entry = `Workers: ${dms.population.workerDescription}\\nSoldiers: ${dms.population.soldierDescription}\\nHomeworld: ${dms.world.homeworld}\\nSecondary: ${dms.world.secondaryLocation}`;\n',
  'identity lore card'
);
replaceOnce(
  '    for (const sector of Object.values(dms.world.lustria.sectors)) { const card = ensureCard(`DMS Lustria Sector — ${sector.name}`, `DMS_LUSTRIA_${sector.id.toUpperCase().replace(/\\W/g, "_")}`); if (card) card.entry = `Status: ${sector.status}\\nThreat: ${sector.threat}\\nResource Sites: ${sector.veins.map(id => { const vein = dms.world.lustria.veins[id]; return `${vein.name} (${id}) — ${vein.status}, ${vein.remaining} remaining`; }).join("; ")}`; }\n  }\n\n  const split',
  '    for (const sector of Object.values(dms.world.lustria.sectors)) { const card = ensureCard(`DMS Lustria Sector — ${sector.name}`, `DMS_LUSTRIA_${sector.id.toUpperCase().replace(/\\W/g, "_")}`); if (card) card.entry = `Status: ${sector.status}\\nThreat: ${sector.threat}\\nResource Sites: ${sector.veins.map(id => { const vein = dms.world.lustria.veins[id]; return `${vein.name} (${id}) — ${vein.status}, ${vein.remaining} remaining`; }).join("; ")}`; }\n    writeSaveCards(dms);\n  }\n\n  const split',
  'save card refresh'
);

replaceOnce(
  '    if (!body || /^help$/i.test(body)) return "DMS: setup; resource define; aptitude; status;',
  '    if (!body || /^help$/i.test(body)) return "DMS: load; setup; resource define; aptitude; status;',
  'help load command'
);
replaceOnce(
  '    if ((match = body.match(/^setup\\s+(.+)$/i))) {',
  '    if (/^load$/i.test(body)) { const loaded = loadSaveCards(dms); for (const key of Object.keys(dms)) delete dms[key]; Object.assign(dms, loaded); output = `Loaded DMS Save revision ${dms.persistence.revision}.`; }\n    else if ((match = body.match(/^setup\\s+(.+)$/i))) {',
  'manual load command'
);

replaceOnce(
  '  const api = Object.freeze({ SCHEMA, RESOURCE_ROLES,',
  '  const api = Object.freeze({ SCHEMA, SAVE_SCHEMA, SAVE_CARD_TITLES, RESOURCE_ROLES,',
  'api save constants'
);
replaceOnce(
  'upgradeDungeon, applyDerivedState, recruitSoldiers,',
  'upgradeDungeon, applyDerivedState, transactResources, spend, rewardResources, resourceStorage, recruitSoldiers,',
  'api transaction exports'
);
replaceOnce(
  'contextGuidance, refreshCards, execute, stableNumber });',
  'contextGuidance, refreshCards, writeSaveCards, readSaveCards, loadSaveCards, execute, stableNumber });',
  'api persistence exports'
);

replaceOnce(
  '    const root = () => (global.state.DMS = normalize(global.state.DMS));\n',
  `    const root = () => {
      const snapshot = readSaveCards();
      let dms = normalize(global.state.DMS);
      if (snapshot && (!global.state.DMS || snapshot.revision > Number(dms.persistence?.cacheRevision || 0))) dms = loadSaveCards(global.state.DMS, snapshot);
      global.state.DMS = dms; return dms;
    };
`,
  'automatic newest-save restore'
);

// Recognized natural System requests use the same execute() operation as /dms.
replaceOnce(
  '    const key = `${actionCount}|${clean(inputText)}|${dms.activity.mode}`; if (dms.activity.lastTurnKey === key) return { repeated: true, reports: [] }; dms.activity.lastTurnKey = key;\n    const benefit = { mode: dms.activity.mode, reports: [], note: "" }, words = clean(inputText);\n',
  '    const key = `${actionCount}|${clean(inputText)}|${dms.activity.mode}`; if (dms.activity.lastTurnKey === key) return { repeated: true, reports: [] }; dms.activity.lastTurnKey = key;\n    const benefit = { mode: dms.activity.mode, reports: [], note: "" }, words = clean(inputText);\n    if (dms.activity.mode === "System" && systemAvailable(dms)) { const natural = words.match(/^system\\s*[:,]\\s*(status|cycle|quest\\s+status|room\\s+list)$/i); if (natural) { benefit.system = execute(dms, `/dms ${natural[1]}`); benefit.note = benefit.system; return benefit; } }\n',
  'natural System command parity'
);

fs.writeFileSync(file, source);
console.log('Applied global DMS foundation patch.');
