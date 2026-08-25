# DMS development and compatibility guide

This document is the change contract for Dungeon Management System development. Its purpose is to keep a local improvement from silently invalidating another subsystem, an existing save, a Story Card, or a verified player path.

Current reference: **DMS 0.10.0-dev**, with Dungeon Tiers 0–1 verified for entry, the Tier 0–3 Story spine defined, and the Tier 2 deployment gate sealed.

Story development must preserve the invariants in [Story Progression](STORY_PROGRESSION.md): one active Story Quest, authoritative-event completion, generated references before presentation, delayed editable-output snapshots, non-inventive Manager reports, spoiler-safe Story Map output, and branch reconvergence.

## Sources of truth

Use these sources in this order:

1. `Library.js` is the authoritative implementation. All shared runtime code belongs there.
2. Automated tests define the currently verified behavior and rejection paths.
3. `docs/TRACKING_BOUNDARY.md` decides whether a fact belongs in mechanical state or narrative lore.
4. `docs/DETAILED_TIER_DEVELOPMENT_MAP.md` defines Tier completion and deployment boundaries.
5. `docs/CONTEXT_ARCHITECTURE.md` defines what is always visible, normally triggered, deliberately injected, or hidden.
6. This guide defines compatibility obligations when any of those systems change.

Documentation may describe planned behavior, but it must label that behavior **planned**, **partial**, or **unverified**. A room definition, command, or Lore Card is not evidence that its mechanic is complete.

## Non-negotiable architecture

- Keep Toolbox, Inner Self/Auto-Cards, and every DMS subsystem in the root `Library.js`.
- Keep `Input.js`, `Context.js`, and `Output.js` as small lifecycle adapters.
- Treat `state.DMS` as a recoverable runtime cache. Managed DMS save cards are the durable mechanical save.
- Give each mechanical mutation one authoritative implementation. Slash commands and natural System requests must call that same operation.
- Let DMS provide facts and legality. Let narration and Lore Cards provide appearance, atmosphere, motives, reactions, and social texture.
- Never infer mechanical changes by semantically interpreting narration. Natural recognition may match controlled terms, then authoritative state and successful operations decide the result.
- Never let card visibility, generated prose, or narration overwrite authoritative state.

## State ownership and context

Every piece of information has one primary context class:

| Class | Purpose | Examples |
| --- | --- | --- |
| Plot Essentials | Continuous identity and changing facts the model must always know | Thronebound Appearance, Attributes, Class lineage, Dungeon Tier, resource stocks |
| Author's Note | Continuous content constraints and immediate scene state | exact Generator content settings and tags, Activity, location, Pace |
| Lore Cards | Naturally triggered narrative context | character history, room appearance, resource lore, Lustria concepts |
| System Cards | Hidden mechanics, UI support, and recovery | save chunks, internal identity, managed status records |

DMS may inject story context only because an authoritative location is active or because DMS is assembling a controlled generation request. It must not scan prose to decide that lore seems relevant.

## Cross-system invariants

### Tier and deployment

- Dungeon Tier runs from 0 to 10; Administrator Capacity is always `1 + (2 × Tier)`.
- Capacity must be full before Dungeon Tier Up.
- Facility Tier and Class Tier cannot exceed Dungeon Tier.
- A later Tier remains inaccessible until `VERIFIED_DUNGEON_TIER` explicitly admits it.
- Raising the verified Tier requires a legitimate player path, natural tutorials, persistence recovery, and automated acceptance through the next-Tier boundary.

### Progression visibility and action truth

- Tier and authoritative Story state are existence gates. Do not expose later facilities, shops, discoveries, commands, cards, or help concepts early.
- A feature that belongs to current progression remains visible when it lacks resources or a currently reachable research/tree prerequisite. Display the exact unmet requirement instead of hiding it.
- Every visible generated option needs a stable manifested identity and the information required to evaluate it. Never show an empty placeholder as an unlocked option.
- Use one computed availability record across status displays, construction/shop cards, natural routing, and mutation functions.
- Distinguish Available, Requires Resources, Research Required, Research In Progress, Under Construction, Constructed, and Purchased. Constructed or purchased entries remain informative but are not actionable again.
- A mechanical refusal is authoritative. Ordinary prose attempts must give the model an explicit action result that forbids narrating task creation, spending, construction, or purchase when the operation failed.

### Resources and tasks

- Construction, Sustenance, and Development keep separate Basic, Intermediate, Advanced, and Mastery stocks.
- Dungeon Energy and Lustrian Marks remain ungraded.
- Resource changes go through centralized transactions so insufficiency checks, reports, storage, rewards, and saves agree.
- Timed work reserves costs at creation. Completion commits the reservation; cancellation returns exactly what was reserved.
- Existing lower-Grade stock is never silently upgraded, replaced, or discarded.

### Facilities and population

- An implemented facility needs an unlock, cost, task, Active state, Expansion, Tier Up, cohort or slot behavior where relevant, a consumed mechanical effect, cards, persistence, and tests.
- Expansion changes quantity: jobs, Soldier positions, suites, routes, or another defined scale.
- Tier Up changes quality: yield, efficiency, capability, or benefit per job.
- There is no global room, Worker, or Soldier capacity.
- Workers and Soldiers are cohorts. Do not introduce individual rank-and-file state.
- Work, permanent Residence, and Current Stay are separate assignments and must not overwrite one another.
- Facility and Job Cohort lore remain separate cards.
- Facility definitions keep stable System names and IDs. Constructed rooms and jobs receive Dungeon-manifested names; mechanics store definitions and IDs while player-facing quest text resolves controlled `{room:...}` and `{job:...}` tokens.

### Administrators and Bond

- The first Administrator is always the Level 1 Manager; Level and random F–SSS Rank are independent.
- Later roles are selected only from currently active Dungeon functions.
- Assignment must validate the Administrator role against the facility function.
- Every Administrator is registered with Inner Self and receives durable DMS and narrative records.
- Bond cannot pass an unresolved five-percent threshold. Bond Events, soft locks, completion, and Rank Up gates must remain explicit and persisted.
- Bond progression and its tutorial begin at Dungeon Tier 1. Tier 0 records the Manager's initial Bond state but does not advance it.

### Classes, Skills, and Traits

- The Thronebound is Classless at Tier 0.
- Thronebound evolution offers three editable or regenerable previews. Acceptance is the only operation that mutates Class, lineage, Skills, and Traits.
- Administrator evolution follows one role-appropriate path and grants only its Combat or Support category plus a Trait.
- Duplicate ability names are rejected before any cost is spent.
- Ordinary Grades unlock at Tiers 1, 4, 7, and 10. Grade Up requires maximum mastery.
- General shops use fixed system-owned prices. Player-specified prices remain debug-only behavior.

### Quests and tutorials

- Quest prose explains the objective; it is never executed as a command.
- Controlled ALL/ANY/NONE terms establish declared intent. Location, Activity, stable references, state, and successful-operation events establish validity.
- Important quests never complete from keywords alone.
- Generated entities are referenced by stable IDs or facility definitions, not display names.
- Quest activation, stage progress, rewards, and notifications must be persisted and retry-safe.
- Tutorials teach normal play first. Slash commands are fallback and debugging controls, not required solutions.
- Independent tutorial chains may be active together; steps remain sequential within each chain.
- Story is the sole mandatory progression category. Internal Dungeon and Thronebound chains remain player-neutral, and a newly activated causal step cannot clear while it is still locked.
- Quest templates distinguish stable System vocabulary, generated Dungeon presentation vocabulary, and persistent external references. Strict templates reject unmanifested population labels, backend facility prose, unresolved references, and authored outcome assumptions.
- Guild and Bounty field objectives remain active after their field conditions are met. Rewards are issued only when the Thronebound deliberately reports the completed contract at an appropriate Lustrian Guild location.
- An Investigation may create a Hunt follow-up only for a Bounty or Hunt mission with a known target and a recorded monster outcome. Escort and Exploration do not imply that transition.
- Tier 1 Class Awakening explicitly requires Dungeon Tier 1, a Classless Thronebound, three reviewed previews, Timeless System Mode in the Throne Room, 20 Basic Development resource, and 15 Dungeon Energy.

### Activity, Cycles, and retry safety

- Activity owns Major Location, Secondary Location, Mode, targets, Pace, Cycle progress, and retry identity.
- System Mode is Timeless. Timed work progresses only through a Pace permitted by its Activity Mode.
- A retried AI Dungeon action must not duplicate a task, generated option, reward, Cycle benefit, quest transition, or notification.
- Accepted or observed generated people, rooms, items, Sectors, veins, and options become permanent canon.

### Initialization and backward compatibility

- The Dungeon Generator emits the stable versioned `DMS_INIT` handoff. The Thronebound Awakening scenario owns the DMS runtime.
- Parse and validate the complete JSON before mutating any state.
- Successful import must remove the raw JSON from continuous Plot context after distributing its exact values.
- Punctuated names must remain valid; dynamic lookup may not depend on unsafe title parsing.
- Unique Attribute names may not duplicate standard Attributes.
- Generator fields must be preserved exactly in their designated Plot, Author's Note, Lore, System, and location-context destinations.
- Keep `test/fixtures/dungeon-generator-sample.json` as the frozen Queen's Vault compatibility fixture. Format changes require an explicit schema version and migration rather than silently rewriting that fixture.

### Persistence and cards

- Normalize new fields and migrate old schemas before consuming them.
- Never overwrite a newer complete save bundle with an older cache.
- Keep save chunks near 1,200–1,500 characters and enforce the 1,800-character maximum.
- Create subsystem save chunks only when their state exists.
- Save after every authoritative change and restore enough state to produce the same legal actions and results.
- `showInStoryCards` and `isSpoiler` are presentation metadata, not mechanics. Runtime visibility changes must use the supported remove/recreate card lifecycle.

## Change impact checklist

When changing one domain, update every connected surface in the same change:

| Change | Required companion work |
| --- | --- |
| Add or rename state | defaults, normalization, derived state, save payload, load/migration, status/card exposure, recovery tests |
| Add a facility | definition, unlock, cost/reservation, build task, Active effect, Expansion, Tier Up, assignments, cards, tutorial, persistence, legal and rejection tests |
| Add a resource use | centralized transaction, Grade rules, storage, reports, reservations where timed, persistence, insufficiency tests |
| Add a natural System phrase | controlled parser, shared authoritative operation, context/mode rejection, quest success event, retry test |
| Change an availability gate | Tier/Story visibility, generated option data, requirements, menu/card/help presentation, authoritative mutation, narrative-result context, success/refusal/retry tests |
| Add a quest | prerequisites, references, triggers, authoritative conditions, rewards, notification, card, save/recovery, retry test |
| Add an Activity benefit | permitted Pace, target rules, Cycle interaction, retry identity, quest event, persistence, tests |
| Add generated content | deterministic seed/key, duplicate policy, approval boundary if editable, Story Card ownership, persistence, retry test |
| Change Generator JSON | Generator outline/output, adapter, validation, context destinations, schema/migration, frozen fixture compatibility tests |
| Change a card | context class, trigger keys, visibility/spoiler policy, size, ownership, refresh/recovery test |
| Raise verified Tier | full Tier mechanics, normal-play tutorials, legitimate economy, persistence gate, AI Dungeon smoke test, next-Tier rejection boundary |

## Required validation

Before calling a change complete:

1. Run `npm run check`.
2. Run `git diff --check`.
3. Inspect the complete working tree and staged diff.
4. For player-facing lifecycle work, run the relevant Tier guide and AI Dungeon smoke path.
5. Reset the runtime cache while retaining save cards, then confirm automatic recovery produces equivalent state.
6. If initialization changed, import the frozen Queen's Vault fixture and complete the Tier 0–1 playthrough test.
7. If a Tier gate changed, prove ordinary play can reach it without test-only resources or direct state edits.

The automated documentation checks keep the stated version and verified Tier aligned with runtime constants, verify local documentation links, and ensure every quoted player-tutorial System request remains recognized by the natural router.

The implementation is ready only when its success path, refusal path, retry behavior, persistence, context presentation, documentation, and player tutorial agree.
