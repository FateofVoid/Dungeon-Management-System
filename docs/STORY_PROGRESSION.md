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

The Manager collates the captured local snapshots, intrusion evidence, known Sites, and known routes. Unknown information stays unknown. The report may establish:

- a canonical Dungeon Sector name;
- evidenced terrain or biome classification;
- known Sites, routes, hazards, inhabitants, factions, and resources;
- certainty.

Reviewing the report in the Throne Room advances the Dungeon Sector to `Mapped` and completes First Contact.

### Dungeon Sector discovery states

1. Unobserved
2. Initial Observation
3. Local Survey
4. Encountered
5. Mapped
6. Established

The immediate Dungeon Sector is evidence-built. Remote Sectors are procedurally generated before a quest names them. Custom Sectors register places already established by narration.

## Tier 2 — Beyond the Perimeter

### Beyond the Perimeter I — First Distant Sector

Activation creates the required remote Sector before displaying its actual name in the objective. Completion requires visiting that exact Sector.

### Beyond the Perimeter II — A Place Beyond

Activation creates the required Site inside the remote Sector before displaying either reference. Completion requires visiting that exact Site.

### Beyond the Perimeter III — Organized Lustria

The Thronebound encounters evidence of an organized Lustrian society, institution, settlement, or faction. The quest does not prescribe its identity or allegiance.

### Beyond the Perimeter IV — The Dominion's Reach

The story must establish five facts: the Dominion is a major power; it watches or regulates Dungeons; higher Tiers increase visibility; actions affect classification; and continued growth is not purely internal. The Dominion is not forced into a benevolent or hostile role.

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
