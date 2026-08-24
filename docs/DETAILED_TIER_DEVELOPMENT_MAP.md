# DMS detailed Tier development map

The Tier 0–10 backbone remains authoritative: Administrator Capacity is `1 + (2 × Tier)`, the established facility sequence remains intact, Class evolution is limited by Dungeon Tier, ordinary ability and resource Grades unlock at Tiers 1/4/7/10, and DMS uses cohorts, quests, Activities, Cycles, and persistent Lustrian operations.

The expanded Lustria systems extend this backbone rather than replacing it. Dungeon Signatures, Survival Doctrine, Sector Resonance Cores, graded resources, major-linked Administrators, and strategic Tier choices must enter play through the existing progression structure.

## Global foundation — required before Tier 0 testing

### Runtime state and persistence

- `state.DMS` is a recoverable runtime cache.
- managed save cards are the durable mechanical save;
- the save reader compares revisions and restores a missing or stale cache automatically;
- an older cache cannot overwrite a newer complete save bundle;
- `/dms load` reconstructs the cache;
- schema 1 saves migrate to the current schema;
- command and natural-action retry identities prevent duplicate effects;
- authoritative natural changes are saved during the input hook, while commands save after their shared operation;
- save payloads split into subsystem-aware chunks above the 1,500-character target and enforce a 1,800-character maximum;
- Progression, Operations, and World cards exist only when their subsystem state requires them;
- ordinary lore and generated Story Cards remain the durable source for descriptions and are not copied into compact save payloads.

### Core resource layer

DMS has atomic gain, spend, insufficiency validation, transaction reports, task reservations, reservation commitment, and exact cancellation returns.

Construction, Sustenance, and Development resources maintain independent Basic, Intermediate, Advanced, and Mastery stocks. Energy and Lustrian Marks are ungraded. Material refinement requires the matching production facility and the Grade's Dungeon/facility Tier. Lustrian veins possess persistent Grades, and extraction requires sufficient facility Tier. Existing lower-Grade stock remains separate and usable.

| Grade | Dungeon and facility availability |
| --- | ---: |
| Basic | Tier 1 |
| Intermediate | Tier 4 |
| Advanced | Tier 7 |
| Mastery | Tier 10 |

### Facility lifecycle

Every facility definition supplies an unlock Tier, cost, construction task, job, and backend function. Construction reserves its cost; completion activates the facility; cancellation returns the reservation. Expansion changes job scale, while Tier Up changes facility quality. Facility and job-cohort cards expose the resulting state and lore.

Mechanical definition properties are consumed by authoritative operations: production, jobs, Soldier positions, productivity, upkeep reduction, defense, scouting, vein targeting and extraction, storage limits, equipment crafting, research gates, shop discounts, portal-route capacity, conquest access, and the Mastery capstone.

### Activity and Cycles

Activity persists major and secondary location, Mode, targets, Pace, Cycle progress, and retry identity. Timed Paces complete Cycles. Cycles advance tasks, production, upkeep, research, extraction, and equipment crafting. Natural actions recognize System requests, construction help, production work, training, Bond scenes, Survey, and Exploration. Spoken System requests can begin timed Construction, Production, Administration, Training, and Bond Activities. System Mode itself remains Timeless.

Expedition progression will use the same task, reservation, Cycle, and retry foundations when Expeditions become a Tier-relevant subsystem.

### Interface

Each mutation has one authoritative operation. Slash commands call it directly; recognized natural System requests translate to the same command operation.

The System can show status, graded resources and Marks, quests, facilities, production, Administrators, Worker cohorts, residences, Class previews and lineage, abilities, fixed-price shops, Activity, tasks, persistent discoveries, the nascent Dungeon Signature, and next-Tier requirements. It supports common management actions including construction and Expansion, assignment, summoning, Class acceptance, shop purchase, residence management, Bond Activity, resource refinement, equipment work, portal routes, and Dungeon advancement. Slash commands remain the precise fallback and debugging interface.

The Tier 0 Signature is deterministically derived, Nascent, Strength 0, and externally undetectable. Later Signature and Survival Doctrine effects remain gated to the Tier where they first change a mechanical result.

### Quest architecture

The categories remain Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty.

The Tier 0 Main Dungeon chain is **Survive the Awakening**, with separate steps for identity, resources, System Mode, the Manager, Administrator Capacity, awakening requirements, and Tier Up. Tiers 1–10 continue the managed Main Dungeon chain after it. The six-lesson **System Awakening** tutorial independently credits reading Status, reading Resources, entering System Mode, summoning the Manager, reading Tier requirements, and completing Tier Up. Facility Operations, Class Development, and Lustrian Exploration remain separate tutorial chains so several systems can be taught concurrently. Conditions are satisfied through normal authoritative actions rather than manual quest completion.

## Tier 0 readiness

Tier 0 has an executable acceptance path in `test/dms-tier0.test.cjs`. It proves a fresh default state can define every required identity field, explicitly confirm Aptitudes, summon the themed Level 1 Manager, clear both onboarding chains, pay the ordinary starting-resource cost, and reach Tier 1 without direct state edits or resource injection. It also proves Throne Room rejection rules, lore-only Tier 0 Gate Authority, Administrator/Inner Self card creation, and cold runtime-cache recovery of identity references, resources, Rank, Bond, quests, and Cycle state.

## Tier 1 readiness

Tier 1 has an executable acceptance path in `test/dms-tier1.test.cjs`.

- Material, Sustenance, Development, and Energy production is driven by active facilities, facility Tier, Expansion-created jobs, Worker housing/disruption, Administrator Rank, named-residence efficiency, and global facility effects.
- Worker cohorts are generated from the configured Worker manifestation, linked to Work and Residence, grouped by facility Tier, and never decomposed into individual records. Worker Habitat housing lowers upkeep and restores disruption; an inactive facility stops its job and production.
- Administrator Capacity is 3. Later summons draw deterministic roles from active functions, assignment and reassignment are authoritative, Rank changes effectiveness, and Administrators retain Bond, Class lineage, Story Cards, and Inner Self registration.
- Administrator Quarters uses expandable private suites. Named Residences add a Bond or assignment-efficiency specialization. The Thronebound Private Chamber supports attendants, invited current stays, and controlled detainment without confusing Work, permanent Residence, and Current Stay.
- The Thronebound receives three editable Class branches. Acceptance is atomic, records permanent Class lineage, grants the correct Skills and Trait, and rejects duplicate names. Administrators receive their single matching evolution rather than a branch choice.
- General Skill and Trait facilities create Basic fixed-price shops. Direct player-priced purchasing is disabled; shop purchases validate facility Tier and target and reject duplicates before spending.
- The **Become Self-Sustaining** Main chain and the independent **Dungeon Economy**, **Class and Abilities**, and **Administrators and Bond** tutorial chains advance through the same operations used by spoken System requests and natural Activity turns.
- Compact recovery restores Class lineage, pending previews, residences, Worker disruption, Tier 1 milestones, quests, and resources. Save chunks remain within the enforced 1,800-character ceiling.
- The acceptance test proves a default, non-injected Tier 1 economy can produce the complete Tier 2 Construction and Energy reserve and fill Administrator Capacity. Tier 2 entry remains sealed until its own deployment gate is verified.

The manual AI Dungeon path is documented in `docs/TIER_1_TESTING.md`.

### Deterministic generation

Administrators, Class previews, shops, Sectors, veins, and Forge equipment options use stable Dungeon identity and sequence keys. Accepted or observed results are retained in authoritative state and Story Cards. Future procedural factions, Sites, and doctrine opportunities must use the same stable generation and persistence contract when their subsystem is introduced.

## Tier completion rule

> A Tier is complete only when all universal mechanics introduced at or below that Tier work, all relevant doctrine options work, the tutorials can teach them through normal play, persistence can restore them, and a player can legitimately reach the next Tier.

An unlock name, room definition, or lore card is not sufficient evidence that a Tier feature is implemented.
