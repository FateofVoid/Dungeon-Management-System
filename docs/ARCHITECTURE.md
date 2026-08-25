# Dungeon Management System architecture

DMS uses the project's established AI Dungeon structure. The root `Library.js` contains Toolbox, Inner Self/Auto-Cards, and DMS Core. The three hook scripts only invoke the shared lifecycle. DMS Core is authoritative for the Thronebound, Dungeon, Administrators, facilities, population cohorts, Classes, quests, Activity, Cycles, and Lustria operations; narration can express those facts but cannot overwrite them. No unrelated scenario-specific domain subsystem is loaded into this runtime.

## What DMS tracks

DMS tracks an exact value when that value determines whether another mechanical action is legal or changes its result. This includes progression, resources and currencies, Administrators, facilities, cohorts, equipment, research, tasks, character development, quests, Activity and Cycles, travel, discovery, Expeditions, territory, Dungeon Signature, Survival Doctrine, and major relationship states when their mechanics exist.

DMS does not ordinarily simulate civilian politics, detailed public opinion, faction economies, rank-and-file individuals, worker happiness, faction-wide military strength, ecological populations, merchant markets, Dominion bureaucracy, religious influence, or elaborate diplomatic scores. Those belong to narration and persistent Story Cards unless a small explicit state becomes necessary for a mechanical gate.

The full decision rule, current implementation audit, and requirements for new state are defined in [the tracking boundary](TRACKING_BOUNDARY.md). The global prerequisites and Tier completion rule are defined in [the detailed Tier development map](DETAILED_TIER_DEVELOPMENT_MAP.md). A facility or lore card is not considered mechanically implemented until its authoritative effects are persisted and tested.

Cross-system invariants, change impact requirements, and release validation are defined in [the development and compatibility guide](DEVELOPMENT_GUIDE.md). The verified functions are introduced to players in operational order by [the Thronebound player tutorial](PLAYER_TUTORIAL.md).

## Dungeon development map

The Dungeon begins at Tier 0 and ends at Tier 10. Administrator Capacity is `1 + (2 × Tier)`, from 1 at Tier 0 to 21 at Tier 10. Reaching the current maximum is mandatory for the next Tier Up. Each new Administrator is summoned into a role selected only from active dungeon functions; the first is always the Manager.

There is no global room or population capacity. Each unlocked facility may be constructed once and developed in two ways. Expansion raises its job population or residential slots. Tier Up raises its benefit per job and updates its themed Appearance. Workers are automatically represented as job cohorts with separate Work and Residence; Soldier cohort positions come from Barracks Expansion.

| Dungeon Tier | Administrator Capacity | Major facility unlocks | Thronebound development |
| ---: | ---: | --- | --- |
| 0 | 1 | Throne Room | Classless; identity, resources, System Mode, first Manager |
| 1 | 3 | resource works, Worker Habitat, Administrator Quarters, Thronebound Private Chamber, Development Sanctum, Energy Conduit, Class Evolution Chamber, General Skill Hall, General Trait Archive | self-sustaining economy; initial three-branch Class Selection; Basic abilities |
| 2 | 5 | Barracks, Training Hall, Administration Office, Scout Lodge, Attribute Training Hall | Soldier cohorts, Lustria scouting, Attribute and mastery training |
| 3 | 7 | Gatehouse, Vein Extraction Facility, Forge, Population Nexus | graded Lustrian vein exploitation; deterministic equipment crafting and assignment |
| 4 | 9 | Laboratory, researched Custom Skill Studio and Trait Atelier, War Room, Grand Vault | Intermediate Grade; custom themed ability research |
| 5 | 11 | Portal Gate, Dungeon Academy | persistent Portal Anchors/routes and Academy shop discounts; advanced progression remains pending |
| 6 | 13 | Elite Barracks, Architectural Core | elite cohorts and advanced construction |
| 7 | 15 | Nexus Observatory | Advanced Grade and high-threat exploration |
| 8 | 17 | Conquest Command | basic controlled-Sector state; full conquest operations pending |
| 9 | 19 | World Gate Array | gate-array definition; remote route operations pending |
| 10 | 21 | Architect Apotheosis Core | Mastery Grade threshold; sovereign capstone mechanics pending |

Tier Up also raises the maximum facility and Class Tier. Facilities unlocked earlier can be Tiered Up as the Dungeon grows.

## Thronebound development map

The Thronebound is generator-authored from the player's Dungeon/character brief, optional tags, and content settings: Name, Race, profile, eight Combat/Support Attribute Aptitudes, and up to five favored Growth Preference Attributes. The system does not ask the player to define a Class.

The separate Dungeon Generator collects four `${question}` inputs—Dungeon and Thronebound Details, Optional Tags, Sexual Content, and Kink Content—then guides the AI through an eight-section outline and emits a versioned `DMS_INIT` JSON String. The Thronebound Awakening scenario has one `${question}` input for that object. DMS validates the full schema before mutation, imports it only into pristine Tier 0 state, and persists its canonical signature so retries or restoration cannot duplicate onboarding. Manual setup commands remain fallback controls.

At Dungeon Tier 1, three Class Preview cards are generated from the dungeon theme. Each contains a Class name and description, Combat Skill, Management Skill, and Trait. The player may edit a preview card, regenerate the options, or accept one. Acceptance updates the Class record, appends the permanent Class Lineage, adds both Skills and the Trait, and creates their individual cards. Duplicate names are rejected before any resource cost is spent.

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

Administrators have Name, Race, canonical Appearance, Personality, Voice, Level, fixed-role Class path, Rank, assignment effectiveness, either Combat or Support Attributes, Skills, Traits, and Bond. Summoned Rank is random from F, E, D, C, B, A, S, SS, and SSS. Rank modifies facility assignment output. Generated character details persist in compact saves and cards, and narrative action resolution instructs the model to embody those details in story prose rather than treating the character as a system-only record.

Administrator Class previews evolve their existing path rather than offering three choices. Combat Administrators receive one Combat Skill and one Trait; Support Administrators receive one Support Skill and one Trait. The same editable-preview acceptance and duplicate protection apply.

Bond stops at every 5% threshold until its Bond Quest is completed. Some events have soft locks for an appropriately Tiered gift or an accessible location. Bond is not directly capped by Dungeon Tier. Sufficient Bond and resources permit Rank Up. Every summoned Administrator is automatically given an Inner Self character card and added to the Inner Self configuration. Worker, Soldier, and Administrator appearances all derive from the same user-defined population nature and typical appearance; their job, archetype, role, and Rank supply the individual adaptation.

## Resources, facilities, and population

The player defines the lore for four mechanically fixed dungeon resource roles:

- Construction material
- Population sustenance
- Thronebound/Administrator development resource
- Dungeon-themed energy and primary currency

Each definition records its name, nature, collection method, and use. Facilities use these roles consistently regardless of their themed names.

Construction, Sustenance, and Development maintain separate Basic, Intermediate, Advanced, and Mastery stocks. Dungeon Energy and Lustrian Marks are ungraded. Timed tasks reserve their costs, commit them on completion, and return them exactly when cancelled. Tiered production facilities can refine their own material role; Lustrian extraction additionally checks the persistent Grade of the targeted Site.

Facility definitions own the backend function, unlock Tier, costs, jobs, yields, and bonuses. When a facility enters current progression, DMS deterministically generates its manifested name, planned Appearance, Function, Job, exact cost, and current readiness before exposing the construction option. Construction establishes that preview as canon. The Facility card then holds current Appearance and Function while a separate Job Cohort card explains the cohort's typical Appearance and duties.

## Quests, Levels, and Aptitudes

Quest categories are Story, Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty. Story owns the single-threaded campaign spine: one Story Quest is active while all other categories may progress in parallel. Tier 0–3 use Awakening, First Contact, Beyond the Perimeter, Development Path, and The Dungeon's Place; Tiers 4–10 use shared entry, selected-path branch, and convergence. Dungeon and Thronebound quests track player-neutral mechanical chains; Tutorials introduce systems; Bond quests gate relationship thresholds beginning at Tier 1; Guild and Bounty quests support Lustria; Personal quests are user-authored and inherit the current Dungeon Tier for reward scaling. See [Story Progression](STORY_PROGRESSION.md).

The Main Dungeon chain has one managed step for every Tier from 0 through 10. Tutorials are divided into independent chains so Foundation, Facility, Class, and Lustrian lessons can advance concurrently through normal play.

Quest presentation and completion are separate. Narrative objectives explain what the world expects; controlled ALL/ANY/NONE trigger groups identify declared intent; exact location, Activity, target, state, and successful-operation conditions decide whether that intent is mechanically valid. Stable System concepts such as `System Status`, `Dungeon Resources`, `System Mode`, and `Tier Requirements` accept flexible word order, punctuation, and basic plurals without semantic interpretation. Generated quest references store stable entity IDs while displaying current canonical names. Internal templates use controlled room, job, resource, System, Administrator, and external-reference tokens so generated Dungeon vocabulary never replaces backend identity. Multi-stage progress, Guild-report state, recorded outcomes, validated Hunt follow-ups, and pending transition notifications are persisted and retry-safe. Guild/Bounty rewards require a deliberate report at a Lustrian Guild location. See [Quest System](QUEST_SYSTEM.md).

Quest experience raises Thronebound Level. Combat, Support, and Unique Attributes are stored as `Attribute (Aptitude): Value` in Plot Essentials. On every Level Up, every Thronebound Attribute independently selects one value from the five outcomes defined by its F–SSS Aptitude. For example, F uses `[0,0,0,0,1]` and SSS uses `[3,4,4,5,5]`. Favored Attributes receive +1 after that roll. Aptitude also affects training results.

Unique Attributes belong to the Thronebound, but their defined effects influence linked Dungeon systems rather than replacing personal Combat or Support Attributes. The generator creates one required Primary Attribute and may create a Secondary and Tertiary Attribute. Priority weights how strongly each contributes to broad Dungeon results and the awakened Dungeon Signature; Administrators also receive a deterministic affinity to one of them. They grow with Thronebound Level Ups and receive the normal favored-Attribute bonus when selected in Growth Preferences. Dungeon Tier Up does not independently roll them.

## Activity, Cycles, and context

Activity records:

- major location: Dungeon, Lustria, Homeworld, or a later configured Secondary world/location;
- immediate secondary location and detail;
- Activity Mode and mechanical targets;
- permitted Pace: Timeless, Slow, Normal, or Fast.

The Homeworld has its own persistent description and a primary return anchor, which becomes the default immediate destination whenever the Thronebound gates Homeworld. The context hook selects exact location fields only from authoritative Major and Secondary Location state. It never scans narration, activated-looking subjects, or Activity targets for Lore Cards. Timed Paces accumulate Cycles; System Mode is Timeless and is required for Administrator summoning. Cycles progress construction, facility upgrades, expansions, production, extraction, upkeep, and research. Natural actions can add mode-specific benefits: construction help shortens tasks based on Craft and Logistics, production help adds Energy, Training advances a target, and Lustrian exploration can discover sectors.

DMS maintains two continuous context blocks. Plot Essentials lists permanent identities and changing mechanical facts, including Appearance, Attributes, Class lineage, ability names, Dungeon Signature, current stocks, and facility state. Author's Note preserves the Generator's exact sexual-content value, kink-content value, and tags above the authoritative Activity State. Managed delimiters allow both blocks to refresh without overwriting unrelated scenario-authored context. Normal Lore Cards retain natural AI Dungeon triggers, while hidden System Cards optimize persistence, recovery, mechanics, and status UI. The explicit partition and injection table are defined in [CONTEXT_ARCHITECTURE.md](CONTEXT_ARCHITECTURE.md).

## Lustria boundary

Global Lustria lore is setting-wide and excludes Eryndral, specific protagonists, and specific dungeons. Scout facilities discover Sectors. Active Lustrian collection facilities expose a Tier-scaled number of vein slots; scouting discovers only compatible veins for currently open slots and links them automatically. Linked veins do not deplete and produce every Cycle while their collection room is active and staffed. Sector threat is compared against Dungeon Combat Power. Expansion supports the collection cohort while Tier improves output and concurrent vein capacity. Conquest Command unlocks territorial control.

The immediate Dungeon Sector is a special evidence-built Sector. Leaving creates an unresolved record but never captures the quest-triggering output. After enough travel context, investigating a local point prepares a snapshot; the following action captures the previous editable story output. The Manager-report pipeline supplies all accumulated snapshots and intrusion evidence to one structured generation turn, accepts only claims grounded by cited evidence IDs, preserves unsupported fields as `Unknown`, and publishes separate lore and system cards. First Contact then establishes a Perimeter Scout cohort, whose first active survey creates the persistent Lustrian Sector neighboring the Dungeon Sector. Continued scouting generates that Sector's primary city, its appearance, and the Sector-city link before the initial city report. Later scouting supports the Lustrian society, Dungeon regulation, and Dominion activity briefing and may discover farther Sectors.

## Story Card player presentation

`showInStoryCards` and `isSpoiler` are derived import/editor metadata; neither is authoritative mechanical state. Scenario decks hide compact save chunks and internal identity cards. Locked facility definitions and locked quests are hidden and marked as spoilers. Active quests and player-readable status cards remain visible. Mechanical legality always comes from `state.DMS`, never from whether a card is visible.

AI Dungeon's supported scripting API exposes and updates only a card's id, triggers, entry, and type. It cannot change `showInStoryCards` or `isSpoiler`. DMS therefore never depends on direct runtime mutation of those fields. A newly relevant hidden facility or quest card is removed and recreated through the supported API, making the replacement visible by default. Completed or no-longer-relevant player cards are removed. The accepted reveal is recorded in deterministic, persisted DMS generation state so retries cannot duplicate it.

Player-visible availability is computed from authoritative progression rather than card presence. Tier and Story gates decide visibility. Current-Tier resource shortages, research, or an available construction-tree prerequisite keep the option visible and state why it is blocked. The same record marks work as Under Construction or Constructed and marks target-specific shop entries as Purchased. Help, menus, cards, and execution all consume these records, so an option cannot be advertised and rejected under different rules.

An ordinary prose instruction that clearly attempts construction, Expansion, facility Tier Up, Dungeon Tier Up, or a shop purchase is resolved mechanically before generation. The context hook supplies an authoritative action-result block. On refusal it explicitly states that no task began, no resource was spent, and no state changed; the model is instructed to narrate the refusal rather than a contradictory success.

Compact save cards use imported hidden reserve cards. DMS claims a reserve by updating its triggers, entry, and type, which preserves its editor-managed hidden presentation; surplus chunks return to the reserve pool. If a scenario is deployed without enough reserves, any newly added save card will use AI Dungeon's default visible presentation. Run `npm run cards:visibility -- <deck.json> 64` when preparing a scenario deck.

## Deterministic generation contract

Generated state uses the Dungeon identity plus stable sequence keys. It must remain stable across retries, use only configured theme and population constraints, establish managed records before narrative description, preserve the Thronebound's user-authored identity, and reject duplicate abilities. Editable Class Preview cards are the deliberate approval boundary between generated suggestions and permanent progression.

Every change must preserve the connected state, operation, context, card, persistence, recovery, tutorial, and test surfaces listed in [the development and compatibility guide](DEVELOPMENT_GUIDE.md). Documentation must distinguish implemented foundations from partial mechanics, planned behavior, and Tiers still sealed by `VERIFIED_DUNGEON_TIER`.
