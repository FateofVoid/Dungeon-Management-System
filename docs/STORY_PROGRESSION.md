# DMS Story Progression

## Governing boundary

Story Quests are the campaign spine. Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty Quests may run beside it, but only one Story Quest may be active at a time.

Dungeon progression proves that the Dungeon is mechanically capable of advancing. Story progression proves that the Dungeon has experienced enough of Lustria to understand what it is advancing into. From Tier 2 onward, Tier Up requirements may require both a mechanical gate and a completed Story milestone.

Story completion uses authoritative state events. Keywords may recognize intent, but they cannot substitute for a location change, generated record, captured observation, resolved event, reviewed report, visited place, learned fact, or selected path.

## Story Map and spoilers

`Story Progress` presents four layers:

- Completed
- Current
- Known Upcoming
- Future Unknown

Branches are listed only after directed adaptation has been discovered. Locked Story Cards remain hidden. The internal definitions may exist earlier for persistence and validation, but the player-facing map must not reveal them.

## Tier 0 — Awakening

### Awakening I — Become the Dungeon's Master

Purpose: become capable of acting as a Dungeon power.

Completion: the Dungeon legitimately reaches Tier 1.

This Story Quest does not repeat the Status, Resources, System Mode, Manager, Capacity, or Tier Up lessons. Those are taught by the System Awakening Tutorial and enforced by the mechanical Tier gate.

## Tier 1 — First Contact

### First Contact I — Leave the Dungeon

The Thronebound crosses the Dungeon threshold. DMS creates `sector-dungeon` with a stable identity, immediate relationship to the Dungeon, and otherwise unknown classification.

Crossing the threshold does **not** capture the following model output. That output may be sparse or later edited.

### First Contact II — Establish the Immediate Perimeter

The Thronebound first establishes travel context through Travel, Survey, or Exploration. A snapshot milestone occurs only when the player deliberately finds and investigates a meaningful nearby point.

Snapshot timing is delayed:

1. the player travels enough to establish surrounding context;
2. the player investigates a local point;
3. DMS marks a snapshot as pending;
4. AI Dungeon produces the scene;
5. the player may edit that output;
6. on the next action, DMS records the preceding story output as evidence.

The quest requires three local snapshots. The first establishes the initial exterior context; later snapshots establish the perimeter. DMS does not infer biome, terrain, factions, resources, or hazards merely from the act of leaving.

### First Contact III — Intrusion

The Dungeon detects a hostile or sufficiently threatening approach or interior presence. Identity, motive, and origin begin unknown. Combat is optional: observation, hiding, capture, negotiation, expulsion, retreat, and sealing a route are valid when they actually resolve the event.

Completion requires an inactive intrusion, at least broad classification, and a surviving functional Dungeon.

### First Contact IV — Review the Manager's Report

The Manager-report pipeline sends every accumulated local snapshot, intrusion record, known Site, and known route to the narrative model as an evidence packet. The model returns a structured Sector report whose claims cite those evidence IDs. Unsupported fields are stored as `Unknown`; the resulting description is written to both a readable lore card and a hidden system card. The report may establish:

- a canonical Dungeon Sector name;
- evidenced terrain or biome classification;
- known Sites, routes, hazards, inhabitants, factions, and resources;
- certainty.

Reviewing the report in the Throne Room advances the Dungeon Sector to `Mapped`.

### First Contact V — Establish External Scouting

After the first intrusion is resolved and the Sector report is reviewed, the Manager urges the Thronebound to construct the Tier 1 Perimeter Scout Post. Constructing it establishes the Dungeon's first external scouting function.

### First Contact VI — The First Survey

Completing a Cycle with the Perimeter Scout cohort active begins the immediate survey, creates the persistent Lustrian Sector neighboring the Dungeon Sector, and completes First Contact. Continued scouting develops that same Sector rather than inventing an unattached city.

### Dungeon Sector discovery states

1. Unobserved
2. Initial Observation
3. Local Survey
4. Encountered
5. Mapped
6. Established

The immediate Dungeon Sector is evidence-built. Remote Sectors are procedurally generated only when later exploration needs them. Custom Sectors register places already established by narration.

## Tier 2 — Beyond the Perimeter

### Beyond the Perimeter I — The Nearby City

After scouting advances beyond the neighboring Sector's first discovery, the system generates its primary city with a durable name, complete appearance, and explicit Sector link. The Manager's initial report presents those facts as canon while treating Dominion danger, Dominion information, Guild access, and later Veil contacts as possibilities until evidence confirms them.

### Beyond the Perimeter II — City Contact

Completion requires visiting the generated city. Visiting it does not force the city to be friendly, hostile, Dominion-aligned, Guild-controlled, or connected to the Veil.

### Beyond the Perimeter III — Extended Scouting

The Scout Lodge extends the established perimeter operation. After sufficient active scouting Cycles, it gathers procedural evidence about organized Lustrian society, Dungeon regulation, and noteworthy Dominion activity.

### Beyond the Perimeter IV — The Lustrian Briefing

The Manager presents an evidence-grounded report on Lustrian society, Dungeon regulation, and noteworthy Dominion activity. Any unsupported subject remains `Unknown`; the report does not force the Dominion into a benevolent or hostile role.

### Beyond the Perimeter V — Patterns of Adaptation

The Thronebound learns that Tier 3 supports deliberate structural adaptation shaped by established behavior, external conditions, and choice.

### Development Path I — Choose an Emerging Approach

The available approaches are:

- Concealment
- Controlled Contact
- Dominion Accord
- Patronage
- Armed Independence

The choice is an emerging approach, not yet an irreversible doctrine. Completion is a hard Story requirement for Tier 3.

## Tier 3 — The Dungeon's Place

Tier 3 means deliberate adaptation.

### The Dungeon's Place I — Deliberate Adaptation

Apply the selected approach to a real strategic problem involving the Dungeon's relationship with Lustria.

### Selected path trial

Only the selected path becomes the active Story branch:

- Path of Concealment I — Vanishing Threshold
- Path of Controlled Contact I — Measured Threshold
- Path of Dominion Accord I — Terms of Recognition
- Path of Patronage I — The Price of Protection
- Path of Armed Independence I — Sovereign Deterrence

### The Dungeon's Place III — Doctrine Crystallized

Review the branch consequence and commit the Dungeon's first doctrine. This reconverges the Story spine and becomes the Story gate for Tier 4.

## Tier 4–10 branching framework

Each later Tier uses a stable three-stage structure:

1. a shared entry establishes the Tier's problem;
2. a branch expresses the selected doctrine or creates a justified opportunity to revise it;
3. a convergence records the lasting consequence and reconnects to the shared spine.

| Tier | Chain | Narrative purpose |
| ---: | --- | --- |
| 4 | Recognition | Determine how established Lustrian powers classify and approach the Dungeon. |
| 5 | Claims | Resolve a durable claim to routes, resources, or territory. |
| 6 | Rival Powers | Confront rivalry, alliance, vassalage, or proxy conflict with another Dungeon power. |
| 7 | Sovereign Doctrine | Advance or revise doctrine as Advanced development becomes possible. |
| 8 | Lustrian Stakes | Accept the political consequences of large-scale operations and conquest. |
| 9 | Worldway | Define the Dungeon's interworld posture toward Lustria and the Homeworld. |
| 10 | Legacy | Resolve the sovereign capstone and the Dungeon's legacy across connected worlds. |

Future branch quests are instantiated only when their Tier and selected doctrine make them relevant. Later framework definitions are not permission to enter an unverified Tier.

## Development invariants

- Exactly one Story Quest is active.
- Other quest categories remain parallel and independent.
- A Story quest cannot complete from keywords alone.
- A place required by a quest exists before the quest names it.
- Generated or captured canon is stable across retries and saves.
- Immediate exterior snapshots use the previous editable story output, never the output that merely activates the quest.
- The Manager organizes evidence but does not invent missing facts.
- Tier Up checks both its mechanical requirements and the required Story milestone.
- Branch titles stay hidden until the branch is known.
