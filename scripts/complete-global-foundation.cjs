const fs = require("node:fs");
const path = require("node:path");
const file = path.join(process.cwd(), "Library.js");
let source = fs.readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`Patch target not found: ${label}`);
  source = source.replace(before, after);
}
function insertBefore(marker, content, label) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error(`Insert target not found: ${label}`);
  source = source.slice(0, at) + content + source.slice(at);
}

if (source.includes('  function normalize(candidate) {')) replaceOnce('  function normalize(candidate) {', '  function normalize(candidate, options = {}) {', 'normalize options');
replaceOnce('    applyDerivedState(dms);\n    updateQuests(dms);\n    return dms;\n  }\n\n  function markStateChanged', '    applyDerivedState(dms);\n    if (options.updateQuests !== false) updateQuests(dms);\n    return dms;\n  }\n\n  function markStateChanged', 'migration-safe quest update');

if (!source.includes('function transactInventory(dms, deltas')) {
  insertBefore('  function resourceStorage(dms) {', `  function transactInventory(dms, deltas, context = "inventory") {
    const normalized = {};
    for (const [rawName, rawAmount] of Object.entries(deltas || {})) {
      const name = clean(rawName); if (!name) throw new Error("Inventory resource name is required.");
      const delta = Number(rawAmount) || 0, current = Number(dms.world.lustria.inventory[name]) || 0;
      if (current + delta < -1e-9) throw new Error(\`Requires \${Math.abs(delta)} \${name}.\`);
      normalized[name] = delta;
    }
    const changes = {};
    for (const [name, delta] of Object.entries(normalized)) { if (!delta) continue; const before = Number(dms.world.lustria.inventory[name]) || 0; dms.world.lustria.inventory[name] = Number((before + delta).toFixed(4)); changes[name] = { before, delta, after: dms.world.lustria.inventory[name] }; }
    if (Object.keys(changes).length) { dms.resourceTransactions ||= []; dms.resourceTransactions.push({ revision: markStateChanged(dms), cycle: dms.activity.cycle, kind: "inventory", context: clean(context), changes }); dms.resourceTransactions = dms.resourceTransactions.slice(-50); }
    return changes;
  }
`, 'inventory transaction helper');
}
replaceOnce('const resource = LUSTRIAN_RESOURCES.find(item => item.key === vein.resourceKey); dms.world.lustria.inventory[resource.name] = (dms.world.lustria.inventory[resource.name] || 0) + amount; report.lustriaResources[resource.name] = (report.lustriaResources[resource.name] || 0) + amount;', 'const resource = LUSTRIAN_RESOURCES.find(item => item.key === vein.resourceKey); transactInventory(dms, { [resource.name]: amount }, `extraction:${room.id}:${vein.id}`); report.lustriaResources[resource.name] = (report.lustriaResources[resource.name] || 0) + amount;', 'centralize extraction inventory');

replaceOnce('const abilities = list => list.map(item => [item.name, item.mastery || 0, item.grade || 1, item.gradeName || "Basic", item.tier || 1]);', 'const abilities = list => list.map(item => [item.name, item.mastery || 0, item.grade || 1, item.gradeName || "Basic", item.tier || 1, item.category || "", item.source || ""]);', 'ability mechanical save');
replaceOnce('bond: a.bond, assignedRooms: a.assignedRooms, classTier: a.class?.tier || 0 }]', 'bond: a.bond, assignedRooms: a.assignedRooms, classTier: a.class?.tier || 0, attrs: a.attributes, skills: abilities(a.class?.skills || []), traits: abilities(a.class?.traits || []) }]', 'administrator progression save');
replaceOnce('const dms = hydrateIdentityFromCards(normalize(candidate || defaultState()));', 'const dms = hydrateIdentityFromCards(normalize(candidate || defaultState(), { updateQuests: false }));', 'load without quest reward replay');

if (!source.includes('function restoreSavedAbilities(saved, lore)')) {
  insertBefore('  function loadSaveCards(candidate, snapshot = readSaveCards()) {', `  function restoreSavedAbilities(saved, lore = []) {
    const loreByName = new Map((Array.isArray(lore) ? lore : []).map(item => [clean(item.name).toLowerCase(), item]));
    return (Array.isArray(saved) ? saved : []).map(tuple => { const [name, mastery, grade, gradeName, tier, category, sourceName] = tuple, details = loreByName.get(clean(name).toLowerCase()) || {}; return { name: clean(name), description: clean(details.description), category: clean(category || details.category), tier: Math.max(1, Number(tier) || 1), mastery: Math.max(0, Number(mastery) || 0), grade: Math.max(1, Number(grade) || 1), gradeName: clean(gradeName) || "Basic", source: clean(sourceName || details.source) || "Recovered" }; });
  }
  function jsonCardField(card, label) { try { const value = JSON.parse(cardField(card, label) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
  function throneAbilityLore(saved) { return (Array.isArray(saved) ? saved : []).map(tuple => { const name = clean(tuple[0]), card = Array.isArray(global.storyCards) ? global.storyCards.find(item => item.title === \`DMS Skill — \${name}\` || item.title === \`DMS Trait — \${name}\`) : null; return { name, description: cardField(card, "Description"), source: cardField(card, "Source") }; }); }
`, 'progression recovery helpers');
}

replaceOnce('const tb = progression.tb || {}; dms.thronebound.level = Math.max(1, Number(tb.level) || dms.thronebound.level); dms.thronebound.experience = Math.max(0, Number(tb.xp) || 0); dms.thronebound.class.tier = Math.max(0, Number(tb.classTier) || 0); dms.thronebound.attributes.unique = tb.unique || dms.thronebound.attributes.unique;', 'const tb = progression.tb || {}, throneCard = saveCardByTitle("DMS — Thronebound"); dms.thronebound.level = Math.max(1, Number(tb.level) || dms.thronebound.level); dms.thronebound.experience = Math.max(0, Number(tb.xp) || 0); dms.thronebound.class.tier = Math.max(0, Number(tb.classTier) || 0); const throneClass = String(throneCard?.entry || "").match(/^Class:\\s*(.+?),\\s*Tier/im); if (throneClass) dms.thronebound.class.name = clean(throneClass[1]); dms.thronebound.class.description = cardField(throneCard, "Class Description") || dms.thronebound.class.description; dms.thronebound.class.skills = restoreSavedAbilities(tb.skills, throneAbilityLore(tb.skills)); dms.thronebound.class.traits = restoreSavedAbilities(tb.traits, throneAbilityLore(tb.traits)); dms.thronebound.attributes.unique = tb.unique || dms.thronebound.attributes.unique;', 'restore Thronebound progression');

replaceOnce('admin.attributes = { [admin.attributeSpecialization]: attributeSet(ATTRIBUTE_TEMPLATES[admin.attributeSpecialization]) }; admin.level = Math.max(1, Number(saved.level) || 1);', 'admin.attributes = saved.attrs || { [admin.attributeSpecialization]: attributeSet(ATTRIBUTE_TEMPLATES[admin.attributeSpecialization]) }; const adminClass = String(card?.entry || "").match(/^Class:\\s*(.+?),\\s*Tier/im); if (adminClass) admin.class.name = clean(adminClass[1]); admin.class.description = cardField(card, "Class Description") || admin.class.description; const skillLore = jsonCardField(card, "Skill Details"), traitLore = jsonCardField(card, "Trait Details"); admin.class.skills = restoreSavedAbilities(saved.skills, skillLore); admin.class.traits = restoreSavedAbilities(saved.traits, traitLore); admin.level = Math.max(1, Number(saved.level) || 1);', 'restore administrator progression');

replaceOnce('Skills: ${admin.class.skills.map(skill => skill.name).join(", ") || "None"}\\nTraits: ${admin.class.traits.map(trait => trait.name).join(", ") || "None"}`;', 'Skills: ${admin.class.skills.map(skill => skill.name).join(", ") || "None"}\\nTraits: ${admin.class.traits.map(trait => trait.name).join(", ") || "None"}\\nSkill Details: ${JSON.stringify(admin.class.skills.map(skill => ({ name: skill.name, description: skill.description, category: skill.category || "", source: skill.source || "", tier: skill.tier || 1 })))}\\nTrait Details: ${JSON.stringify(admin.class.traits.map(trait => ({ name: trait.name, description: trait.description, category: trait.category || "", source: trait.source || "", tier: trait.tier || 1 })))}`;', 'administrator lore recovery detail');

replaceOnce('persistence: { saveSchema: SAVE_SCHEMA, revision: 0, cacheRevision: 0, lastSavedRevision: 0 },', 'persistence: { saveSchema: SAVE_SCHEMA, revision: 0, cacheRevision: 0, lastSavedRevision: 0, lastCommandKey: "" },', 'command retry default');
replaceOnce('activity: { mode: dms.activity.mode, pace: dms.activity.pace, targets: dms.activity.targets, location: dms.activity.location, lastTurnKey: dms.activity.lastTurnKey || "" } }', 'activity: { mode: dms.activity.mode, pace: dms.activity.pace, targets: dms.activity.targets, location: dms.activity.location, lastTurnKey: dms.activity.lastTurnKey || "" }, commandKey: dms.persistence.lastCommandKey || "" }', 'command retry save');
replaceOnce('dms.persistence = { saveSchema: SAVE_SCHEMA, revision: snapshot.revision, cacheRevision: snapshot.revision, lastSavedRevision: snapshot.revision };', 'dms.persistence = { saveSchema: SAVE_SCHEMA, revision: snapshot.revision, cacheRevision: snapshot.revision, lastSavedRevision: snapshot.revision, lastCommandKey: clean(core.commandKey) };', 'command retry restore');

replaceOnce('if (global.state.DMSCommandTurn) { try { global.state.DMSCommandOutput = execute(dms, raw); } catch (error) { global.state.DMSCommandOutput = `Error: ${error.message}`; } global.state.runInnerSelf = false; return; }', 'if (global.state.DMSCommandTurn) { const commandKey = `${Number(global.info?.actionCount) || 0}|${raw}`; if (dms.persistence.lastCommandKey === commandKey) global.state.DMSCommandOutput = "Command already applied; state unchanged."; else try { global.state.DMSCommandOutput = execute(dms, raw); dms.persistence.lastCommandKey = commandKey; writeSaveCards(dms); } catch (error) { global.state.DMSCommandOutput = `Error: ${error.message}`; } global.state.runInnerSelf = false; return; }', 'slash command retry guard');

if (!source.includes('transactResources, transactInventory, spend')) replaceOnce('transactResources, spend, rewardResources,', 'transactResources, transactInventory, spend, rewardResources,', 'export inventory transaction');

fs.writeFileSync(file, source);
console.log("Applied final persistence/retry recovery safeguards.");
