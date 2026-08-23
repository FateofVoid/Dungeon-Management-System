# Release A working save record

Recorded on 2026-08-23 after commit `3545349` installed the Release A runtime in the private AI Dungeon scenario.

## Save identity

- Scenario: `ScbLdcdTCA2K` — Dungeon Management System — Lustria
- Authoritative adventure: `uU_GOTbiO8tG`
- Restore-validation copy: `EvoxYxw9jzBs`
- DMS Save revision: 16
- Runtime cache revision: 16
- Dungeon: The Ashen Court, Tier 1
- Thronebound: Mara, Voidkin, Level 2, Classless Class Tier 0
- Theme and style: Volcanic necromancy; Gothic basalt fortress
- Administrator: Volcanic Manager 1, Level 1, Rank D, Support Manager, Bond 0%
- Administrator Capacity: 1/3
- Facilities: Tier 1 Throne Room only; eight Tier 1 facility definitions unlocked
- Activity: Dungeon — Throne Room; System / Timeless; Cycle 0 at 0%
- Dungeon Signature: Awakened, Strength 11, externally undetectable

## Resource state

| Resource role | Themed name | Stored |
| --- | --- | ---: |
| Construction | Graveglass | 50 Basic |
| Sustenance | Cinder Marrow | 100 Basic |
| Development | Sovereign Ichor | 115 Basic |
| Dungeon Energy | Pyreflow | 140 |
| Lustrian Marks | Marks | 0 |

## Verification evidence

- Completed the complete System Awakening path through spoken System requests: help, status, resources, management mode, Manager summoning, Tier requirements, and Tier 1 awakening.
- Tier 2 was refused by the verified-deployment gate before later progression requirements were evaluated.
- Removing the runtime cache preserved save revision 16. The next natural status request automatically recovered an identical state from save cards.
- The duplicated adventure loaded revision 16 with `/dms load`; its following natural status response matched the authoritative adventure field for field.
- The current save occupies 17 save-card chunks. The largest card is 1,224 characters, below the 1,500-character target and 1,800-character hard limit.
- The historical live adventure contains 1,831 Story Cards because turns run before the managed-card registry fix had already created duplicates. After the fixed runtime initialized its durable registry, consecutive turns remained at exactly 1,831 cards.
- A deduplicated restore export contains 181 unique Story Cards. It is retained locally as `DMS Release A Story Cards Restore.json` beside the Codex task workspace.
- AI Dungeon exposed backup export but no backup ZIP import control. The separate Story Card import reached Chrome's native file picker, but automated file selection requires the browser extension's local-file permission. The supported adventure-duplication recovery path was therefore used for the verified restore comparison.
- `npm run check` passed all 62 tests after the live-only duplicate-card failure was reproduced and covered by an automated key-based Story Card API test.

## Canonical baseline

This record is the Release A comparison baseline. A later save may replace it only after the new state passes the same natural Tier path, character-limit assertion, cold-cache recovery, explicit load, and deterministic state comparison.
