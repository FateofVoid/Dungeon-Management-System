# Tier 1 AI Dungeon smoke test

This test begins from a clean Tier 1 awakening. Do not use slash commands or manually edit runtime state. Address requests to the System in dialogue; perform timed work through ordinary story actions.

## Economy and Workers

1. Ask the System to construct Material Works, then begin Construction Activity for it. Help construct it until a Cycle completes and the facility becomes Active.
2. Begin Production Activity and work through enough turns to complete a Cycle. Ask the System to show production and confirm Basic Construction output.
3. Construct Sustenance Works and Worker Habitat. Ask to see Worker cohorts and confirm each card separates Work, Residence, Tier, population, housing state, and efficiency.
4. Expand a facility and complete its task through timed Activity. Confirm its job cohort grows. Ask how facility Tier Ups work and confirm the Throne Room completed the Tier 0-to-1 facility awakening while later facility Tier Ups require matching Dungeon Tier.
5. Construct the Development Sanctum and Energy Conduit. Complete Cycles until all four production types have produced resources. Confirm Energy remains ungraded.

## Administrators and residences

1. With an active facility function available, summon a second Administrator. Confirm their role is compatible with an active function, while their Rank and Level remain separate.
2. Assign them to a compatible facility, complete a production Cycle, and compare the displayed output with the unassigned output.
3. Construct Administrator Quarters, assign a private suite, and optionally name it with a Bond or Efficiency specialization. Expansion must add suites rather than creating a global Administrator residence cap.
4. Optionally construct the Thronebound Private Chamber. Verify invited Current Stay and controlled detainment assignments remain separate from Work and permanent Residence.
5. Ask the System to begin Bond Activity with the Administrator. Spend meaningful story turns together until 5%; confirm Bond stops at the gate. Resolve the personal scene naturally and confirm the 5% Bond Event clears before Bond can rise again.

## Class and abilities

1. Ask the System to show all three Thronebound Class previews. Edit a preview Story Card or ask for regeneration if desired.
2. Accept one option through a spoken System request. Confirm the current Class, permanent Class Lineage, Combat Skill, Management Skill, Trait, and separate ability cards.
3. Construct either the General Skill Hall or General Trait Archive. Ask to see shops and buy one numbered Basic entry for a valid linked character.
4. Attempt to buy the same entry again. It must reject the duplicate without spending Development resources or Energy.
5. Ask how mastery and Grades work. Confirm Basic begins at Tier 1 and the next ordinary Grade remains unavailable until Tier 4 and maximum mastery.

## Main-chain and recovery gate

1. Continue ordinary production until Administrator Capacity is 3/3 and the Tier 2 reserve is fully funded. The **Become Self-Sustaining** chain and `Main Dungeon — Complete Tier 1` must clear, but Tier 2 entry must remain sealed.
2. Record the displayed Dungeon state, resources, Class lineage, Administrators, residences, Worker disruption, quests, Activity, and Cycle.
3. Remove only the simulated runtime cache while preserving Story Cards. The next natural System request must recover the same state automatically.
4. Export and restore the backup with its Story Cards, use the explicit load fallback once, and compare the same fields again.
5. Confirm every `DMS Save` Story Card remains at or below 1,800 characters. Generated Tier 1 cards should remain compact and independently scoped.
