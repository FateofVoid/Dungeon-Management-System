# Dungeon Management System development rules

## Runtime structure

- Preserve the Aetheria AI Dungeon format.
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

A Tier is complete only when all universal mechanics introduced at or below that Tier work, all relevant doctrine options work, tutorials teach them through normal play, compact persistence restores them, and a player can legitimately reach the next Tier. A definition or lore card alone does not count as implementation. Use [the detailed Tier development map](docs/DETAILED_TIER_DEVELOPMENT_MAP.md) for the current completion contract.
