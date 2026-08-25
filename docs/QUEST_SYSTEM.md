# DMS Quest System

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

Dynamic quest creation rejects references that are not currently known or unlocked. Future procedural generation must use the same validation before accepting a quest.

## Stages and transitions

Each stage may have its own trigger groups, context requirements, and completion conditions. Completing a stage advances the persisted stage index; completing the final stage clears and rewards the quest.

Quest transitions queue story-facing notifications:

- a new directive when a quest activates;
- a progress notice when a stage advances;
- immersive completion text followed by a concise Quest Complete, Reward, and Next Quest block.

The queue is compactly persisted. Output drains it once, so retries cannot duplicate rewards or notifications.

## Story Cards

Tutorial cards use Purpose, How to Use, Requirements, Key Terms, Why It Matters, Objective, Progress, and Rewards. Normal quests use a shorter Brief, Objective, Relevant Context, Key Terms, Progress, and Rewards layout.

When a relevant Category has no active quest, DMS may expose a contextual no-current-quest status card. Bond becomes relevant after the first Administrator. Guild and Bounty remain hidden until their Categories are actually introduced.
