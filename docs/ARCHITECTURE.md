# Dungeon Management System architecture

DMS uses the Aetheria AI Dungeon structure. The root `Library.js` contains Toolbox, Inner Self/Auto-Cards, and DMS Core. The three hook scripts only invoke the shared lifecycle. DMS Core is authoritative for the Thronebound, Dungeon, Administrators, facilities, population cohorts, Classes, quests, Activity, Cycles, and Lustria operations; narration can express those facts but cannot overwrite them.

## Dungeon development map

The Dungeon begins at Tier 0 and ends at Tier 10. Administrator Capacity is `1 + (2 × Tier)`, from 1 at Tier 0 to 21 at Tier 10. Reaching the current maximum is mandatory for the next Tier Up. Each new Administrator is summoned into a role selected only from active dungeon functions; the first is always the Manager.

There is no global room or population capacity. Each unlocked facility may be constructed once and developed in two ways. Expansion raises its job population. Tier Up raises its benefit per job and updates its themed Appearance. Workers are automatically represented as job cohorts; Soldier cohort positions come from Barracks Expansion.

| Dungeon Tier | Administrator Capacity | Major facility unlocks | Thronebound development |
| ---: | ---: | --- | --- |
| 0 | 1 | Throne Room | Classless; identity, resources, System Mode, first Manager |
| 1 | 3 | resource works, habitat, Development Sanctum, Energy Conduit, Class Evolution Chamber, General Skill Hall, General Trait Archive | initial three-branch Class Selection; Basic abilities |
| 2 | 5 | Barracks, Training Hall, Administration Office, Scout Lodge, Attribute Training Hall | Soldier cohorts, Lustria scouting, Attribute and mastery training |
| 3 | 7 | Gatehouse, Vein Extraction Facility, Forge, Population Nexus | Lustrian vein exploitation and equipment development |
| 4 | 9 | Laboratory, researched Custom Skill Studio and Trait Atelier, War Room, Grand Vault | Intermediate Grade; custom themed ability research |
| 5 | 11 | Portal Gate, Dungeon Academy | stable travel and advanced Class development |
| 6 | 13 | Elite Barracks, Architectural Core | elite cohorts and advanced construction |
| 7 | 15 | Nexus Observatory | Advanced Grade and high-threat exploration |
| 8 | 17 | Conquest Command | sustained Lustrian territorial conquest |
| 9 | 19 | World Gate Array | remote and multi-world operations |
| 10 | 21 | Architect Apotheosis Core | Mastery Grade and sovereign capstone functions |

Tier Up also raises the maximum facility and Class Tier. Facilities unlocked earlier can be Tiered Up as the Dungeon grows.

## Thronebound development map

The Thronebound is mostly user-authored: Name, Race, Attribute Aptitudes, preferences, and theme-defined Unique Attributes. The system does not ask the user to define a Class.

At Dungeon Tier 1, three Class Preview cards are generated from the dungeon theme. Each contains a Class name and description, Combat Skill, Management Skill, and Trait. The player may edit a preview card, regenerate the options, or accept one. Acceptance updates the Class record, adds both Skills and the Trait, and creates their individual cards. Duplicate names are rejected.

Every later Class Up repeats the three-branch preview process and requires:

1. the Dungeon at the target Tier;
2. the Class Evolution Chamber at the target Tier;
3. the themed Development and Energy cost;
4. acceptance of one editable preview.

Skills and Traits have mastery from 0–100% and ordinary Grades. Maximum mastery is required before a Grade Up.

| Grade | Minimum Tier |
| --- | ---: |
| Basic | 1 |
| Intermediate | 4 |
| Advanced | 7 |
| Mastery | 10 |

Unique, Apex, and Growth are supported as special nonstandard Grades. General Skills and Traits come from separate facilities with a separate shop card for every facility Tier. Custom facilities require Laboratory research and produce a limited shop from one player-defined theme. Attribute Training Hall functions spend Dungeon Energy to train Attributes and ability mastery.

## Administrators and Bond

Administrators have Name, Race, Level, fixed-role Class path, Rank, assignment effectiveness, either Combat or Support Attributes, Skills, Traits, and Bond. Summoned Rank is random from F, E, D, C, B, A, S, SS, and SSS. Rank modifies facility assignment output.

Administrator Class previews evolve their existing path rather than offering three choices. Combat Administrators receive one Combat Skill and one Trait; Support Administrators receive one Support Skill and one Trait. The same editable-preview acceptance and duplicate protection apply.

Bond stops at every 5% threshold until its Bond Quest is completed. Some events have soft locks for an appropriately Tiered gift or an accessible location. Bond is not directly capped by Dungeon Tier. Sufficient Bond and resources permit Rank Up. Every summoned Administrator is automatically given an Inner Self character card and added to the Inner Self configuration.

## Resources, facilities, and population

The player defines the lore for four mechanically fixed dungeon resource roles:

- Construction material
- Population sustenance
- Thronebound/Administrator development resource
- Dungeon-themed energy and primary currency

Each definition records its name, nature, collection method, and use. Facilities use these roles consistently regardless of their themed names.

Facility definitions own the backend function, unlock Tier, costs, jobs, yields, and bonuses. Unlock cards expose Function and Job Name without inventing an Appearance. Construction creates the themed Appearance. The Facility card then holds Appearance and Function while a separate Job Cohort card explains the cohort's typical Appearance and duties.

## Quests, Levels, and Aptitudes

Quest categories are Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty. Dungeon and Thronebound quests track progression milestones; Tutorials introduce systems; Bond quests gate relationship thresholds; Guild and Bounty quests support Lustria; Personal quests are user-authored and inherit the current Dungeon Tier for reward scaling.

Quest experience raises Thronebound Level. Combat and Support Attributes are stored as `Attribute [Aptitude]: Value`. Aptitude ranges F–SSS and selects from five possible gains on each growth roll. Player preference weights which Attributes receive Level Up growth. Aptitude also affects training results.

## Activity, Cycles, and context

Activity records:

- major location: Dungeon, Lustria, Homeworld, or a configured Secondary world/location;
- immediate secondary location and detail;
- Activity Mode and target Story Cards;
- permitted Pace: Timeless, Slow, Normal, or Fast.

The context hook loads matching location and target lore so these fields affect the story as well as mechanics. Timed Paces accumulate Cycles; System Mode is Timeless and is required for Administrator summoning. Cycles progress construction, facility upgrades, expansions, production, extraction, upkeep, and research. Natural actions can add mode-specific benefits: construction help shortens tasks based on Craft and Logistics, production help adds Energy, Training advances a target, and Lustrian exploration can discover sectors.

## Lustria boundary

Global Lustria lore is setting-wide and excludes Eryndral, specific protagonists, and specific dungeons. Scout facilities discover sectors and resource veins. Sector threat is compared against Dungeon Combat Power. Extraction facilities target discovered veins; Expansion supports their job cohort while Tier improves extraction and concurrent operations. Conquest Command unlocks territorial control.

## Deterministic generation contract

Generated state uses the Dungeon identity plus stable sequence keys. It must remain stable across retries, use only configured theme and population constraints, establish managed records before narrative description, preserve the Thronebound's user-authored identity, and reject duplicate abilities. Editable Class Preview cards are the deliberate approval boundary between generated suggestions and permanent progression.
