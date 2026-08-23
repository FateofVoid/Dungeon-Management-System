# DMS tracking boundary

## Governing rule

DMS tracks anything whose exact value determines whether another mechanical action is legal or changes its result.

The system provides authoritative facts. The story provides texture.

Mechanical state belongs in DMS when it gates an action, pays or receives a cost, changes a calculation, advances through Cycles, establishes persistent discovery, or must survive retries and save recovery. Narrative facts belong in Story Cards when they provide identity, appearance, atmosphere, motives, local reactions, or context without independently changing a mechanical rule.

## Authoritative mechanical scope

DMS is expected to track these domains when their mechanics are implemented:

- Dungeon Tier, facility Tier and Expansion, Administrator Capacity, and other progression gates;
- dungeon resources, Lustrian resources, resource Grades, Lustrian Marks, costs, yields, storage, and transactions;
- Administrators, roles, Ranks, Levels, assignments, Classes, abilities, Bond thresholds, and mechanically significant relationship states;
- rooms, equipment, research, tasks, construction, production, defense, training, and Academy progression;
- Worker and Soldier cohorts, assignments, archetypes, numbers, cohort Tier, casualties, and aggregate combat contributions;
- Thronebound Levels, Aptitudes, Attributes, Classes, Skills, Traits, mastery, Grades, previews, and advancement requirements;
- quests, prerequisites, categories, Ranks, objectives, progress, completion, and rewards;
- Activity, location, targets, Pace, Cycle progress, natural-action benefits, and retry identity;
- Sector access, persistent discoveries, resource veins, ownership, depletion, extraction, Expeditions, logistics, combat resolution, and territory;
- portal routes, Anchors, route limits, availability, throughput, and suppression when those values gate travel;
- Dungeon Signature, detection, suppression, Survival Doctrine, and major political relationship states when they change access, costs, eligibility, conflict, or another mechanical outcome.

## Narrative-only scope

DMS should generally not simulate:

- civilian politics or detailed public opinion;
- detailed faction economies or every merchant market;
- every Guild member or every Soldier individually;
- worker happiness;
- faction-wide military strength;
- ecological population models;
- exact Dominion bureaucracy;
- religious influence;
- elaborate diplomatic score matrices.

These subjects may be narrated and preserved in focused Story Cards when they become relevant. If one later creates a mechanical gate, DMS should store only the smallest explicit fact needed—for example `Hostile`, `Neutral`, `Recognized`, `Tributary`, or a specific treaty flag—instead of simulating the surrounding society.

## Current implementation audit

This table distinguishes implemented mechanics from definitions or lore that do not yet affect authoritative results.

| Domain | Current state | Boundary assessment |
| --- | --- | --- |
| Dungeon Tier and Administrator Capacity | Implemented | Tier 0–10, costs, capacity, facility/Class limits, and Tier gates are authoritative. |
| Themed dungeon resources | Implemented foundation | Names, lore, separate Grade stocks, costs, production, refinement, upkeep, reservations, and transactions are tracked. Energy remains ungraded. |
| Administrators | Implemented foundation | Roles, Rank, Level fields, assignment, Class path, abilities, Bond gates, Rank Ups, and Inner Self registration are tracked. Administrator experience progression remains limited. |
| Rooms and cohorts | Implemented foundation | Construction, tasks, Tier, Expansion, assignments, Worker cohorts, Soldier cohorts, production, and several aggregate modifiers are tracked. |
| Thronebound progression | Implemented foundation | Level, experience, Aptitudes, Attributes, Classes, previews, Skills, Traits, mastery, ordinary Grades, and costs are tracked. |
| Quests | Partial | Records, categories, prerequisites, status, rewards, independent tutorial chains, a Tier 0–10 Main Dungeon chain, and Bond gates exist. Quest Rank, richer objective progress, and full Guild/Bounty generation remain incomplete. |
| Activity and Cycles | Implemented foundation | Location, mode, targets, Pace, retry safety, timed tasks, production, extraction, upkeep, and several natural actions are authoritative. Recognition and activity-specific outcomes remain narrow. |
| Sectors, veins, and discovery | Implemented foundation | Generated Sectors and veins persist; access, targeting, extraction, depletion, securing, and a simple controlled-territory list exist. Ownership and richer access rules remain incomplete. |
| Equipment and Forge | Implemented foundation | Forge options are deterministic; crafting uses reserved graded resources and Cycles; items, assignment, bonuses, Story Cards, and recovery are authoritative. Broader equipment types and upgrade paths remain future work. |
| Research | Partial | Custom Skill/Trait facility research uses tasks and persistence. A general research tree, project effects, and broader unlock rules do not exist. |
| Storage | Implemented foundation | Tier 4 enables enforced resource limits; active Grand Vault Tier increases those limits. |
| Defense and combat | Partial | Soldier cohorts and aggregate Dungeon Combat Power gate Sector actions. Attack resolution, damage, casualties, defense state, and recovery are absent. |
| Expeditions and logistics | Not implemented | Scouting resolves immediately; there are no Expedition records, deployment, duration, supply, return, or casualty states. |
| Portals and routes | Implemented foundation | Observed Anchors persist; active Portal facilities determine route capacity; routes have open/closed state, Energy costs, legal travel, Story Cards, and recovery. Throughput and suppression remain future work. |
| Academy progression | Partial | The Academy now provides an active Tier-scaled Skill/Trait shop discount. Its dedicated curriculum and advanced progression structure remain incomplete. |
| Lustrian Marks | Implemented foundation | The ungraded wallet, atomic gain/spend validation, reporting, commands, and compact recovery are authoritative. Prices and broader economic uses remain future work. |
| Dungeon Signature | Lore only | Signature, detection, and suppression have lore cards but no calculated state or mechanical consequences. |
| Survival Doctrine | Not implemented | No doctrine selection, effects, or persistence exist. |
| Political relationships | Not implemented | No major-faction or dungeon relationship states currently gate play. This should remain minimal when introduced. |
| Territory | Partial | Controlled Sector identifiers persist, but ownership claims, contest state, benefits, and loss conditions remain incomplete. |

## Rules for future systems

Before implementing a new field, answer:

1. Which action becomes legal or illegal because of this exact value?
2. Which calculation or outcome changes because of it?
3. Can the same purpose be served by a smaller enum, flag, counter, or reference?
4. How is the value created, changed, validated, displayed, persisted, and recovered?
5. Which tests prove both its successful use and its rejection paths?

If the first two answers are both “none,” the concept belongs in narration or a Story Card rather than DMS state.
