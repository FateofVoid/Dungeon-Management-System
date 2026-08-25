# Dungeon Management System development rules

## Runtime structure

- Preserve the project's established AI Dungeon integration format.
- All shared runtime code, including DMS, Toolbox, Inner Self, and Auto-Cards, belongs in the root `Library.js`.
- Keep `Input.js`, `Context.js`, and `Output.js` as minimal lifecycle hooks.

## Tracking boundary

Use [docs/TRACKING_BOUNDARY.md](docs/TRACKING_BOUNDARY.md) as the source of truth before adding state or a subsystem.

DMS tracks an exact value when that value determines whether another mechanical action is legal or changes its result. The authoritative state must be deterministic, persisted, exposed where the player needs it, and covered by tests.

DMS does not simulate narrative texture merely because it can change during a story. Civilian politics, detailed public opinion, faction economies, named rank-and-file members, individual Soldiers, worker happiness, faction-wide military strength, ecological population models, merchant markets, Dominion bureaucracy, religious influence, and elaborate diplomatic scores belong in narration and persistent Story Cards when relevant.

Major political relationships or territory enter DMS state only when a small explicit state changes access, cost, eligibility, production, conflict resolution, or another mechanical result. Store the smallest state needed; do not build a general social simulation.

## Implementation contract

- The system provides authoritative facts; narration provides appearance, atmosphere, motives, reactions, and social texture.
- Never let narration directly overwrite managed mechanical state.
- Represent Workers and Soldiers as functional cohorts, not individual records. Administrators and other mechanically significant linked characters may be individual records.
- Persist discovered locations, routes, veins, factions, and other generated facts once they affect play.
- A facility is not mechanically complete merely because it has a definition or lore card. Its state and rules must change legality or results, survive save recovery, and have tests.
- New tracked fields require normalization, compact-save persistence, recovery, status or card exposure when player-facing, and tests for legal and illegal transitions.
- Do not duplicate lore across broad cards. Tiers, Ranks, Grades, categories, and other independently triggered concepts use compact individual cards.

## Progression presentation contract

- Tier and authoritative Story progression decide whether a feature exists in the player-facing interface. Future or irrelevant options remain hidden and must not be named by help, menus, or active cards.
- Once a feature belongs to current progression, generate its stable player-facing identity and required lore before displaying it.
- Resource stock and currently satisfiable research or construction-tree requirements do not hide a current option. Show the option with exact requirements and one authoritative state: Available, Requires Resources, Research Required, Research In Progress, Under Construction, Constructed, or Purchased.
- Menus, Story Cards, natural requests, and direct operations must consume the same availability calculation. A completed or in-progress action is never presented as a valid new action.
- When ordinary prose attempts a managed action, expose its authoritative success or refusal to the model. A refused action creates no task, spends nothing, and must not be narrated as simultaneously succeeding.

A Tier is complete only when all universal mechanics introduced at or below that Tier work, all relevant doctrine options work, tutorials teach them through normal play, compact persistence restores them, and a player can legitimately reach the next Tier. A definition or lore card alone does not count as implementation. Use [the detailed Tier development map](docs/DETAILED_TIER_DEVELOPMENT_MAP.md) for the current completion contract.

## Change compatibility

Use [the development and compatibility guide](docs/DEVELOPMENT_GUIDE.md) before changing state, facilities, resources, natural System routing, quests, Activities, generation, initialization, persistence, cards, or a verified Tier gate. A change is incomplete until every connected state, operation, context, persistence, recovery, tutorial, documentation, and test surface remains consistent.

Story changes must also preserve [the Story progression contract](docs/STORY_PROGRESSION.md): one active Story Quest, no duplication of mechanical tutorials, authoritative-event completion, delayed editable-output snapshots for the Dungeon Sector, generated references before quest presentation, Manager reports that preserve unknowns, spoiler-safe maps, and branch reconvergence.

Player-facing functionality must be taught in the order a player needs it through ordinary System speech and story Activities. Keep [the Thronebound player tutorial](docs/PLAYER_TUTORIAL.md) synchronized with the current verified path; slash commands remain fallback and debugging controls.
