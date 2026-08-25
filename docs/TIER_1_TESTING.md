# Tier 1 AI Dungeon smoke test

This test begins from a clean Tier 1 awakening. Do not use slash commands or manually edit runtime state. Address requests to the System in dialogue; perform timed work through ordinary story actions.

## Availability and narrative truth

1. Ask the System to show Facilities. Confirm Tier 1 options have generated names, planned lore, exact costs, and readiness states, while Barracks and every later-Tier facility are absent.
2. Choose a visible option whose resources are insufficient. Confirm it remains listed as **Requires Resources**, and attempting construction creates no room, task, or resource transaction.
3. Fund and begin that option. Confirm it changes to **Under Construction**, cannot be started twice, and becomes **Constructed** only after its task completes.
4. State one impossible construction attempt as ordinary prose rather than a System command. Confirm the story describes the authoritative refusal and does not simultaneously begin construction.
5. Before an ability facility is Active, confirm no shop card or entries appear. After activation, confirm entries show Available or Requires Resources; after purchase, confirm the target's entry is marked Purchased and is not actionable again.

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

1. Complete First Contact I–IV through external travel, delayed evidence snapshots, a player-neutral intrusion resolution, and the Manager's generated Sector report. Confirm every accumulated snapshot is supplied to the generation context, unsupported report fields remain `Unknown`, and both the readable lore card and hidden system card retain the resulting Sector canon.
2. Follow the Manager's recommendation to construct the Perimeter Scout Post, then complete a Cycle with its cohort active. Confirm **First Contact V–VI** clear and the neighboring Lustrian Sector is generated and persisted. Continue scouting and confirm the later city report generates the city's appearance inside that same Sector rather than creating an unattached location. Political relationships may remain unconfirmed.
3. Continue ordinary production until Administrator Capacity is 3/3 and the Tier 2 reserve is fully funded. The production, population, facility, administration, and Class Awakening chains must converge on **Self-Sustaining Dungeon I**, but Tier 2 entry remains sealed until its deployment gate is verified.
4. Record the displayed Dungeon state, resources, Class lineage, Administrators, residences, cohort disruption, scouting state, Sector report, quests, Activity, and Cycle.
5. Remove only the simulated runtime cache while preserving Story Cards. The next natural System request must recover the same state automatically.
6. Export and restore the backup with its Story Cards, use the explicit load fallback once, and compare the same fields again.
7. Confirm every `DMS Save` Story Card remains at or below 1,800 characters. Generated Tier 1 cards should remain compact and independently scoped.
