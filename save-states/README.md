# DMS reference save states

This directory preserves verified AI Dungeon Story Card exports for regression testing and later mechanical-state comparison.

## Release A Tier 1 baseline

[`release-a-tier1-revision16-story-cards.json`](release-a-tier1-revision16-story-cards.json) is the canonical Story Card snapshot for the Release A working save recorded on 2026-08-23.

- Source adventure: `uU_GOTbiO8tG`
- DMS Save revision: 16
- Cards: 181 unique keys
- DMS save chunks: 17
- Presentation metadata: all 17 save chunks and the internal identity card use `showInStoryCards: false`; active Tier 1 facility and quest references remain player-visible. Locked content uses `isSpoiler: true` in addition to being hidden until relevant.
- Largest save-card value: 1,224 characters
- SHA-256: `240f552bbad2ea6412d24eef0506c545740a27303c31e79d6516b3779f92a765`

The source adventure contained historical duplicate cards created before the durable managed-card registry fix. This reference keeps the latest card for each key, which preserves the current mechanical save while removing those obsolete duplicates.

Import this snapshot only into a disposable or intended restore adventure. AI Dungeon Story Card import replaces the destination adventure's existing Story Cards. It is not the clean scenario-template card set because it intentionally contains Mara, The Ashen Court, the summoned Manager, and the revision-16 DMS save chunks.
