# DMS Quest System

For the player-facing order in which these functions are introduced, see [the Thronebound player tutorial](PLAYER_TUTORIAL.md). Any quest change must also preserve the connected parser, authoritative operation, persistence, context, tutorial, and retry rules in [the development and compatibility guide](DEVELOPMENT_GUIDE.md).

Story Quests are the single-threaded campaign spine and are not Dungeon-development checklists. Only one Story Quest may be active; all other categories may progress in parallel. The authoritative early campaign and later branching framework are defined in [Story Progression](STORY_PROGRESSION.md).

## Boundary

DMS does not interpret narrative meaning. It recognizes controlled terms, checks authoritative mechanical context, and records successful operations. AI Dungeon remains responsible for ordinary Story Card triggering and narrative texture.

The governing rule is:

> Quest text explains what the world expects. Trigger terms identify what the player is attempting. Authoritative state decides whether the attempt is valid.

## Quest record

A normalized quest may contain:

- stable ID, Category, Chain, Step, Tier, title, description, and objective;
- hints and blocked guidance;
- required location, Activity, target, and state conditions;
- alternative trigger groups using `all`, `any`, and `none`;
- progress and completion conditions;
- stable references to Administrators, rooms, facility functions, Sectors, resource Sites, Story Cards, or System concepts;
- staged progress;
- rewards and immersive completion text;
- repeatable, generic, status, reward, and progress state.
- scope, strict-template validation, and mission type;
- field-complete, report-required, reported, outcome, and follow-up state for external contracts.

Objective prose is never executed as a command.

## Trigger matching

Terms are normalized for capitalization, punctuation, typographic apostrophes, and basic plurals. Order does not matter.

```text
{ all: ["system", "status"] }
```

matches `System Status`, `Status, System`, and a longer action that addresses the System with both terms.

```text
{
  all: ["door"],
  any: ["look", "inspect", "study"],
  none: ["leave", "ignore"]
}
```

requires the door plus one inspection term and rejects either excluded term. Multiple groups are alternatives: satisfying any complete group passes the language gate.

Keywords never complete an important quest by themselves. The quest must be active, its prerequisites must be cleared, required references must exist, location and Activity must match, and any required successful-operation event must occur.

## System concepts

The early vocabulary is stable and Tier-aware:

- Tier 0: System Help, System Status, Dungeon Status, Dungeon Resources, System Mode, Summoning, Administrators, Administrator Capacity, Quests, Activity, and Tier Requirements.
- Tier 1: Facilities, Production, Population, Residences, Evolution, Skills and Traits, Bond, and Tasks.
- Tier 2+: Portal Anchors and Discoveries; later verified Tiers expose later concepts such as Dungeon Signature.

Read-only concepts can be used without entering System Mode but require the Throne Room. Management mutations require Timeless System Mode. Specific management actions continue to delegate to the same authoritative operations used by `/dms`; slash commands remain fallback and debugging controls.

## Stable references

Quest mechanics store IDs or facility definitions, never generated names:

```text
{ type: "administrator", id: "administrator-3" }
{ type: "room", id: "room-5" }
{ type: "facility", definition: "material-works" }
{ type: "sector", id: "sector-2" }
{ type: "vein", id: "vein-4" }
```

Presentation resolves the current canonical name. A deliberate rename therefore updates the displayed quest without breaking its target.

## Vocabulary and presentation tokens

Quest authoring separates three vocabularies:

1. **System vocabulary** is stable mechanical terminology such as Material Works, Worker Cohort, Expansion, Rank, Class, and Activity.
2. **Dungeon vocabulary** is generated presentation canon such as manifested room names, job names, resources, and Administrators.
3. **External vocabulary** is persistent adventure canon referenced by stable Sector, Site, person, faction, or Story Card identity.

Internal quest templates store controlled presentation tokens rather than hard-coding a generic manifestation:

```text
Activate {room:material-works}, employ {job:material-works},
and produce Basic {resource:construction}.
```

The record remains mechanically tied to `material-works`; the player sees the Dungeon's current manifested room, job, and resource names. Supported tokens resolve rooms, jobs, System functions, resources, Administrators, and role-labelled external references. Strict templates reject unknown tokens, locked-future facilities, generic population assumptions, backend facility names outside tokens, unresolved references, and prose that claims an investigation's outcome before state establishes it.

Dynamic quest creation rejects references that are not currently known or unlocked. Future procedural generation must use the same validation before accepting a quest.

## Stages and transitions

Each stage may have its own trigger groups, context requirements, and completion conditions. Completing a stage advances the persisted stage index. A newly unlocked causal step first becomes visible and active; it cannot pass directly from locked to rewarded merely because its condition was already satisfied.

Non-story progression is chain-based only where one lesson or mechanical dependency genuinely causes the next. Tier 1's four production foundations are independent and may be active together. The `Story` category owns the one mandatory progression chain; Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty chains support their narrower purposes.

### Outcomes and external follow-ups

Investigations record outcome facts separately from authored objectives. An Investigation may open a Hunt follow-up only when the contract is a Bounty or Hunt, the recorded outcome is a monster, and a stable target is already known. Escort and Exploration never infer a Hunt merely because a monster appeared.

### Guild reporting

Guild and Bounty quests do not clear when their field objective finishes. They enter **Field objective complete; report to the Guild** state. The Thronebound must return to a suitable Lustrian Guild location and naturally report, submit, turn in, or claim the contract. Only that report clears the quest, issues XP/resources/Marks, and creates any validated follow-up. `/dms quest report` is a precise fallback; direct `/dms quest complete` is disabled.

Quest transitions queue story-facing notifications:

- a new directive when a quest activates;
- a progress notice when a stage advances;
- immersive completion text followed by a concise Quest Complete, Reward, and Next Quest block.

The queue is compactly persisted. Output drains it once, so retries cannot duplicate rewards or notifications.

## Story Cards

Tutorial cards use Purpose, How to Use, Requirements, Key Terms, Why It Matters, Objective, Progress, and Rewards. Normal quests use a shorter Brief, Objective, Relevant Context, Key Terms, Progress, and Rewards layout.

When a relevant Category has no active quest, DMS may expose a contextual no-current-quest status card. Bond becomes relevant at Tier 1 after an Administrator exists. Guild and Bounty remain hidden until their Categories are actually introduced.

## Tier 1 Thronebound Class Awakening

The concrete Thronebound chain is **Class Awakening I–III**:

1. confirm Dungeon Tier 1, a Classless Thronebound, exactly three generated previews, 20 Basic Development resource, 15 Dungeon Energy, and Timeless System Mode in the Throne Room;
2. review all three previews, including Class description, Combat Skill, Management Skill, and Trait;
3. accept one branch, atomically create the Class and abilities, and append the first permanent Class-lineage record.

Acceptance rejects duplicates and cannot occur before the previews have been reviewed. Later Class advancement adds its facility and Tier requirements to the same authoritative pattern.
