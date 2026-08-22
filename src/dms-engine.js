// Dungeon Management System — domain layer
// Toolbox and Inner Self remain attributable, isolated vendor foundations.
(function installDungeonManagement(global) {
  "use strict";

  const SCHEMA = 1;
  const MODES = Object.freeze(["Idle", "Survey", "Construction", "Administration", "Recruitment", "Defense", "System"]);
  const PACES = Object.freeze({ Timeless: 0, Slow: 0.25, Standard: 1 / 3, Fast: 0.5, Immediate: 1 });
  const ROOM_ROLES = Object.freeze(["Entrance", "Lair", "Resource", "Trial", "Sanctum", "Workshop", "Habitat", "Vault"]);
  const ADMIN_ROLES = Object.freeze(["Steward", "Warden", "Architect", "Quartermaster", "Keeper", "Envoy"]);

  const clean = value => String(value == null ? "" : value).trim();
  const unique = values => [...new Set(values.map(clean).filter(Boolean))];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  function stableNumber(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  const choose = (values, seed) => values[stableNumber(seed) % values.length];

  function defaultState() {
    return {
      schema: SCHEMA,
      initialized: false,
      tronebound: { name: "Unnamed Tronebound", title: "Tronebound", level: 1, stats: {} },
      dungeon: {
        name: "Unnamed Dungeon",
        theme: "Unformed",
        style: "Adaptive",
        population: [],
        rank: 1,
        power: 0,
        capacity: 1,
        resources: {}
      },
      administrators: {},
      rooms: {},
      activity: { mode: "Idle", targets: [], pace: "Timeless", cycle: 0, progress: 0 },
      quests: {
        focus: "main",
        records: {
          "establish-core": { title: "Establish the Dungeon Core", status: "active", objective: "Define the dungeon theme, style, and intended population." },
          "shape-first-room": { title: "Shape the First Room", status: "locked", objective: "Generate the dungeon's first room from its identity." },
          "appoint-first-administrator": { title: "Appoint the First Administrator", status: "locked", objective: "Create or appoint an Administrator suited to the dungeon." }
        }
      },
      generation: { sequence: 0 },
      log: []
    };
  }

  function normalize(candidate) {
    const base = defaultState();
    const value = candidate && typeof candidate === "object" ? candidate : {};
    const merged = {
      ...base,
      ...value,
      tronebound: { ...base.tronebound, ...(value.tronebound || {}) },
      dungeon: { ...base.dungeon, ...(value.dungeon || {}) },
      activity: { ...base.activity, ...(value.activity || {}) },
      quests: { ...base.quests, ...(value.quests || {}) },
      generation: { ...base.generation, ...(value.generation || {}) }
    };
    merged.schema = SCHEMA;
    merged.dungeon.population = unique(Array.isArray(merged.dungeon.population) ? merged.dungeon.population : clean(merged.dungeon.population).split(","));
    merged.administrators = merged.administrators && typeof merged.administrators === "object" ? merged.administrators : {};
    merged.rooms = merged.rooms && typeof merged.rooms === "object" ? merged.rooms : {};
    merged.log = Array.isArray(merged.log) ? merged.log.slice(-50) : [];
    merged.activity.mode = MODES.includes(merged.activity.mode) ? merged.activity.mode : "Idle";
    merged.activity.pace = Object.hasOwn(PACES, merged.activity.pace) ? merged.activity.pace : "Timeless";
    merged.activity.targets = unique(Array.isArray(merged.activity.targets) ? merged.activity.targets : []);
    return merged;
  }

  function configure(dms, specification) {
    const spec = specification || {};
    dms.tronebound.name = clean(spec.tronebound) || dms.tronebound.name;
    dms.dungeon.name = clean(spec.name) || dms.dungeon.name;
    dms.dungeon.theme = clean(spec.theme) || dms.dungeon.theme;
    dms.dungeon.style = clean(spec.style) || dms.dungeon.style;
    if (spec.population !== undefined) dms.dungeon.population = unique(Array.isArray(spec.population) ? spec.population : clean(spec.population).split(","));
    dms.initialized = dms.dungeon.theme !== "Unformed" && dms.dungeon.style !== "Adaptive" && dms.dungeon.population.length > 0;
    updateQuests(dms);
    record(dms, `Dungeon identity configured: ${dms.dungeon.theme} / ${dms.dungeon.style}.`);
    return dms;
  }

  function generateRoom(dms, requestedRole) {
    if (!dms.initialized) throw new Error("Define theme, style, and population before generating rooms.");
    const number = ++dms.generation.sequence;
    const seed = `${dms.dungeon.name}|${dms.dungeon.theme}|${dms.dungeon.style}|${dms.dungeon.population.join("|")}|room|${number}`;
    const role = requestedRole && ROOM_ROLES.includes(requestedRole) ? requestedRole : choose(ROOM_ROLES, seed);
    const inhabitant = choose(dms.dungeon.population, `${seed}|population`);
    const id = `room-${number}`;
    const room = {
      id,
      name: `${dms.dungeon.theme} ${role}`,
      role,
      theme: dms.dungeon.theme,
      style: dms.dungeon.style,
      population: [inhabitant],
      state: "Established",
      level: Math.max(1, dms.dungeon.rank),
      features: [`${dms.dungeon.style} construction`, `${inhabitant} habitat`]
    };
    dms.rooms[id] = room;
    dms.dungeon.capacity += 1;
    record(dms, `Generated ${room.name} (${id}).`);
    updateQuests(dms);
    return room;
  }

  function generateAdministrator(dms, requestedName, requestedRole) {
    if (!dms.initialized) throw new Error("Define the dungeon before appointing Administrators.");
    const number = Object.keys(dms.administrators).length + 1;
    const seed = `${dms.dungeon.name}|${dms.dungeon.theme}|administrator|${number}`;
    const role = requestedRole && ADMIN_ROLES.includes(requestedRole) ? requestedRole : choose(ADMIN_ROLES, seed);
    const origin = choose(dms.dungeon.population, `${seed}|origin`);
    const name = clean(requestedName) || `${dms.dungeon.theme} ${role}`;
    const id = `administrator-${number}`;
    const administrator = {
      id,
      name,
      role,
      origin,
      status: "Active",
      loyalty: 50,
      goals: [`Advance the ${dms.dungeon.theme} dungeon identity`, `Fulfill the duties of ${role}`],
      assignedRooms: []
    };
    dms.administrators[id] = administrator;
    record(dms, `Appointed ${name} as ${role}.`);
    updateQuests(dms);
    return administrator;
  }

  function setActivity(dms, mode, targets, pace) {
    const canonicalMode = MODES.find(value => value.toLowerCase() === clean(mode).toLowerCase());
    if (!canonicalMode) throw new Error(`Unknown Activity Mode. Use: ${MODES.join(", ")}.`);
    const canonicalPace = Object.keys(PACES).find(value => value.toLowerCase() === clean(pace || "Timeless").toLowerCase());
    if (!canonicalPace) throw new Error(`Unknown pace. Use: ${Object.keys(PACES).join(", ")}.`);
    dms.activity = { ...dms.activity, mode: canonicalMode, targets: unique(targets || []), pace: canonicalPace };
    return dms.activity;
  }

  function advanceActivity(dms, contribution = 1) {
    const amount = PACES[dms.activity.pace] * clamp(contribution, 0, 100);
    dms.activity.progress += amount;
    while (dms.activity.progress >= 1) {
      dms.activity.progress -= 1;
      dms.activity.cycle += 1;
      dms.dungeon.power += Math.max(1, Object.keys(dms.rooms).length);
      record(dms, `Completed management cycle ${dms.activity.cycle}.`);
    }
    return dms.activity;
  }

  function updateQuests(dms) {
    const quests = dms.quests.records;
    if (dms.initialized) {
      quests["establish-core"].status = "cleared";
      quests["shape-first-room"].status = Object.keys(dms.rooms).length ? "cleared" : "active";
      quests["appoint-first-administrator"].status = Object.keys(dms.rooms).length ? (Object.keys(dms.administrators).length ? "cleared" : "active") : "locked";
    }
  }

  function record(dms, message) {
    dms.log.push({ cycle: dms.activity.cycle, message: clean(message) });
    dms.log = dms.log.slice(-50);
  }

  function status(dms) {
    return [
      `Tronebound: ${dms.tronebound.name} | Level ${dms.tronebound.level}`,
      `Dungeon: ${dms.dungeon.name} | Rank ${dms.dungeon.rank}`,
      `Identity: ${dms.dungeon.theme} / ${dms.dungeon.style}`,
      `Population: ${dms.dungeon.population.join(", ") || "Undefined"}`,
      `Rooms: ${Object.keys(dms.rooms).length} | Administrators: ${Object.keys(dms.administrators).length}`,
      `Activity: ${dms.activity.mode} / ${dms.activity.pace} | Cycle ${dms.activity.cycle}`
    ].join("\n");
  }

  function contextGuidance(dms) {
    if (!dms.initialized) return "The dungeon remains unformed. Do not invent a settled theme, style, population, rooms, or Administrators before the user defines them.";
    return `The Tronebound is ${dms.tronebound.name}, mystically bound to ${dms.dungeon.name}. The dungeon's authoritative identity is Theme: ${dms.dungeon.theme}; Style: ${dms.dungeon.style}; Population: ${dms.dungeon.population.join(", ")}. New rooms, Administrators, inhabitants, resources, hazards, rewards, and architecture must be derived from and remain compatible with this identity. Do not overwrite managed records from narration alone.`;
  }

  function parsePipe(value) {
    return clean(value).split("|").map(clean);
  }

  function execute(dms, raw) {
    const body = clean(raw).replace(/^\/dms\s*/i, "");
    let match;
    if (!body || /^help$/i.test(body)) return "DMS commands: /dms setup <Tronebound>|<Dungeon>|<Theme>|<Style>|<Population,...>; /dms status; /dms room generate [Role]; /dms administrator add [Name]|[Role]; /dms mode <Mode>|<Targets,...>|<Pace>; /dms quest status.";
    if (/^status$/i.test(body)) return status(dms);
    if ((match = body.match(/^setup\s+(.+)$/i))) {
      const [tronebound, name, theme, style, population] = parsePipe(match[1]);
      configure(dms, { tronebound, name, theme, style, population });
      return `Dungeon configured.\n${status(dms)}`;
    }
    if ((match = body.match(/^room\s+generate(?:\s+(.+))?$/i))) {
      const room = generateRoom(dms, clean(match[1]));
      return `Room generated: ${room.name} [${room.role}] — ${room.population.join(", ")}.`;
    }
    if ((match = body.match(/^administrator\s+add(?:\s+(.+))?$/i))) {
      const [name, role] = parsePipe(match[1]);
      const administrator = generateAdministrator(dms, name, role);
      return `Administrator appointed: ${administrator.name}, ${administrator.role} (${administrator.origin}).`;
    }
    if ((match = body.match(/^mode\s+(.+)$/i))) {
      const [mode, targets, pace] = parsePipe(match[1]);
      setActivity(dms, mode, clean(targets).split(","), pace);
      return `Activity set: ${dms.activity.mode} / ${dms.activity.pace}${dms.activity.targets.length ? ` — ${dms.activity.targets.join(", ")}` : ""}.`;
    }
    if (/^quest\s+status$/i.test(body)) return Object.values(dms.quests.records).map(quest => `[${quest.status.toUpperCase()}] ${quest.title}: ${quest.objective}`).join("\n");
    throw new Error("Unrecognized DMS command. Use /dms help.");
  }

  const api = Object.freeze({ SCHEMA, MODES, PACES, ROOM_ROLES, ADMIN_ROLES, defaultState, normalize, configure, generateRoom, generateAdministrator, setActivity, advanceActivity, updateQuests, status, contextGuidance, execute, stableNumber });
  global.DMSCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof global.state !== "undefined") {
    function root() {
      global.state.DMS = normalize(global.state.DMS);
      return global.state.DMS;
    }
    function commandOutput(text) {
      return `> **DUNGEON MANAGEMENT SYSTEM**\n>\n${String(text).split("\n").map(line => `> ${line}`).join("\n")}`;
    }
    global.DungeonManagement = function DungeonManagement(hook) {
      const dms = root();
      if (hook === "input") {
        const raw = clean(global.text);
        global.state.DMSCommandTurn = /^\/dms(?:\s|$)/i.test(raw);
        if (global.state.DMSCommandTurn) {
          try { global.state.DMSCommandOutput = execute(dms, raw); }
          catch (error) { global.state.DMSCommandOutput = `Error: ${error.message}`; }
          global.state.runInnerSelf = false;
          return;
        }
        if (typeof global.handleToolboxInput === "function") global.handleToolboxInput();
        return;
      }
      if (hook === "context") {
        if (global.state.DMSCommandTurn) { global.stop = false; global.text = typeof global.ABORT_OUTPUT === "string" ? global.ABORT_OUTPUT : ""; return; }
        if (typeof global.handleToolboxContext === "function") global.handleToolboxContext();
        if (!global.stop) global.text = `${global.text}\n\nAuthor's note: ${contextGuidance(dms)}`;
        return;
      }
      if (hook === "output") {
        if (global.state.DMSCommandTurn) {
          global.text = commandOutput(global.state.DMSCommandOutput);
          delete global.state.DMSCommandOutput;
          global.state.DMSCommandTurn = false;
          return;
        }
        if (typeof global.handleToolboxOutput === "function") global.handleToolboxOutput();
      }
    };
  }
})(globalThis);
