# Tier 0 testing guide

Tier 0 is ready for a focused AI Dungeon playtest when the complete path below succeeds without editing `state.DMS`, granting resources, or manually completing quests.

## Player path

1. Complete the separate Dungeon Generator scenario from one creative brief, copy its final `DMS_INIT` JSON String, then start Thronebound Awakening and paste it into the sole setup input before the Opening.
2. Confirm the Opening, Plot Essentials, and conditional setup cards reuse the same answers where the exact `${question}` text appears.
3. On the first action, verify DMS imports every mandatory answer atomically. `/dms setup`, `/dms resource define`, and the Aptitude commands remain fallback/debug controls and should not be needed for a new scenario.
4. While in the Throne Room, say “System, show my Dungeon Status” and “System, show my resources.” Read-only System requests do not require entering management mode.
5. Say “System, enter management mode.” Confirm the Activity becomes `System / Timeless` while the location remains `Dungeon — Throne Room`.
6. Say “System, summon the Manager.” The result must be a Level 1 Manager whose Rank is independently generated from F–SSS. DMS must create both the Administrator card and the matching Inner Self registration.
7. Ask “System, what is required to awaken Tier 1?” It must report Administrator Capacity 1/1 plus the Basic construction-resource and ungraded Dungeon Energy costs.
8. Say “System, awaken Tier 1.” It must spend the real stored cost, clear both Tier 0 chains, advance the Dungeon and Throne Room to Tier 1, raise Administrator Capacity to 3, and generate—without accepting—the initial Class previews.

The Thronebound must remain Classless until a preview is accepted. The Tier 0 Signature must report Nascent, Strength 0, and too weak for external detection.

## Rejection checks

- System Mode cannot be entered outside the Throne Room.
- The Manager cannot be summoned outside Throne Room System Mode.
- Tier Up cannot be performed outside Throne Room System Mode.
- Once the identity is complete, identity, resources, Aptitudes, and Thronebound Unique Attributes cannot be changed outside Throne Room System Mode.
- A missing or malformed mandatory variable answer must not partially initialize or overwrite an existing Dungeon.
- Retrying the first action must not import the variables twice or duplicate quest rewards.
- Travel narration at Tier 0 must not create a persistent Portal Anchor.
- Tier Up must fail if Administrator Capacity is not full or either required stock is insufficient.

## Persistence gate

Preserve Story Cards, remove the simulated `state.DMS` cache, then invoke the next DMS lifecycle hook or `/dms load`. The recovered Tier 0 state must retain Dungeon and Thronebound identity references, exact resource stocks, the scenario-variable import marker, the Manager's Level/Rank/Bond, quest statuses, current Activity, Cycle, and partial Cycle progress. Plot Essentials and Author's Note must be rebuilt from recovered state without duplicating their managed blocks or deleting unrelated text. Save cards should remain below the configured 1,500-character target where practical and must never exceed 1,800 characters.

## Automated acceptance

Run:

```text
npm run check
```

The Tier 0-specific acceptance cases are in `test/dms-tier0.test.cjs`; the full command also runs the global foundation and migration suite.

The latest verified browser save and recovery evidence is recorded in [Release A working save](RELEASE_A_WORKING_SAVE.md).
