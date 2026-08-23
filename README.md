# Dungeon Management System

A theme-driven AI Dungeon system centered on the **Thronebound**: a player-created character bound to a growing dungeon. The player defines the dungeon's theme, style, populations, Homeworld, and four resources. DMS turns those seeds into facilities, jobs, Administrators, Classes, quests, population cohorts, and Lustrian operations while keeping mechanical state under script control.

The runtime follows the Aetheria project format. Toolbox, Inner Self/Auto-Cards, and every DMS subsystem are contained in the root `Library.js`; `Input.js`, `Context.js`, and `Output.js` remain minimal hooks.

DMS tracks exact facts that gate actions or change mechanical results; narration and Story Cards handle social and descriptive texture. The authoritative scope and current implementation gaps are recorded in [the tracking boundary](docs/TRACKING_BOUNDARY.md).

## Current system

- Dungeon Tiers 0–10, with new facilities at every Tier
- Administrator Capacity of `1 + (2 × Dungeon Tier)`; it must be full before each Dungeon Tier Up
- no global room, Worker, or Soldier capacity
- one constructible instance of every unlocked facility; Expansion adds its jobs and Tier Up improves its yield or benefit
- a separate Facility card and Job Cohort card for every constructed room
- one themed resource each for Construction, Sustenance, linked-character Development, and Dungeon Energy
- separate Basic, Intermediate, Advanced, and Mastery stocks for material resources; ungraded Dungeon Energy and Lustrian Marks
- task resource reservations with exact refunds on cancellation
- randomly ranked and role-limited Administrators, automatic Inner Self registration, assignments, Bond Events every 5%, and Bond-gated Rank Ups
- a Classless Tier 0 Thronebound with three editable Class previews at Tier 1 and three more at every later evolution
- Administrator Class previews that evolve their fixed path and grant only Combat or Support abilities as appropriate
- General Skill and Trait shops, researched custom-theme shops, mastery training, and Grade Ups
- Dungeon, Thronebound, Tutorial, Bond, Personal, Guild, and Bounty quests, including a Tier 0–10 Main Dungeon chain and independent tutorial chains
- Aptitudes from F to SSS, preference-weighted random Attribute growth, and quest-based Levels
- location-aware Activity Mode, timed Cycles, construction/production/training/exploration benefits, and timeless System Mode
- Lustria scouting, persistent resource-vein discovery, extraction and depletion, Combat Power gates, Sector securing, and basic controlled-Sector state
- deterministic Forge equipment options, Cycle-based crafting, assignments, and persistent Portal Anchors and routes

## Starting progression

Tier 0 contains only the Tier 0 Throne Room. The Thronebound is Classless. AI Dungeon character-creation variables define identity, all eight Aptitudes, optional Unique Attributes, and the four resources before the Opening begins. On the first lifecycle hook, DMS atomically imports the resolved answers and will not overwrite established state on a retry. Read Status and Resources, enter Timeless System Mode in the Throne Room, summon the first Administrator (always a Level 1 Manager with an independently generated Rank), read the Tier requirements, and pay the Tier cost to awaken Tier 1. The seven-step **Survive the Awakening** Main Quest and six-lesson **System Awakening** tutorial track those actions automatically.

The Dungeon Signature is Nascent and externally undetectable at Tier 0. Early Gate Authority may support travel narration, but it creates no mechanical Portal Anchor until Tier 2. Read-only System voice requests are available in the Throne Room during awakening; established identity changes, summoning, and Tier Up require Timeless System Mode there.

At Tier 1, DMS produces three editable Thronebound Class Preview cards. Accepting one grants a themed Class, one Combat Skill, one Management Skill, and one Trait. Construct the Class Evolution Chamber for later Class Ups; both the Dungeon and the Chamber must reach the target Tier.

Facility development has two independent axes:

- **Expansion** adds more jobs or Soldier cohort positions.
- **Tier Up** improves yield, extraction, training, or other benefits per job and regenerates the facility's Appearance lore.

Worker cohorts are automatically created and assigned from facility jobs. Soldiers become available through Barracks and are recruited into combat archetype cohorts.

## Develop from any computer

On GitHub, choose **Code → Codespaces → Create codespace on main**. The included development-container configuration validates the monolithic scripts and runs the test suite, so no local IDE is required.

## Commands

Values separated by `|` are distinct fields. Administrator targets may use an Administrator ID or exact name. The setup, resource-definition, Aptitude, and Unique Attribute commands remain migration/debug fallbacks; new scenarios should import [the setup-variable Story Cards](DMS%20Scenario%20Setup%20Story%20Cards.json).

```text
/dms setup <Thronebound>|<Race>|<Dungeon>|<Theme>|<Style>|<Workers>|<Soldiers>|<Homeworld>|[Secondary location]
/dms resource define <construction|sustenance|development|energy>|<Name>|<Description>|<Collection>|<Use>
/dms resource <gain|spend> <role>|<amount>|[Grade]
/dms resource refine <construction|sustenance|development>|<amount>|<Grade>
/dms marks <gain|spend> <amount>
/dms aptitude <Attribute>|<F–SSS>|<Preference 1–5>
/dms aptitudes confirm
/dms attribute unique <Name>|<Description>|<Value>
/dms status
/dms resources
/dms facilities
/dms administrators
/dms population
/dms activity
/dms discoveries
/dms signature
/dms tier requirements

/dms dungeon upgrade
/dms room list
/dms room build <function-key>
/dms room upgrade <room-id>
/dms room expand <room-id>
/dms task list
/dms task cancel <task-id>
/dms cycle

/dms administrator summon [Name]|[Race]
/dms administrator assign <Administrator>|<room-id>
/dms administrator rank <Administrator>
/dms bond add <Administrator>|<amount>
/dms bond complete <Administrator>

/dms class preview <thronebound|Administrator>
/dms class regenerate <thronebound|Administrator>
/dms class accept <thronebound|Administrator>|<option>
/dms skill buy <target>|<Name>|<Description>|<Development cost>
/dms skill train <target>|<Skill or Trait>|<amount>
/dms skill grade <target>|<Skill or Trait>
/dms attribute train <Attribute>|<Energy>
/dms shop buy <general|custom>|<target>|<skill|trait>|<tier>|<entry 1–3>
/dms research custom <skill|trait>|<Theme>
/dms shop custom <skill|trait>|<Theme>

/dms equipment preview [Purpose]
/dms equipment craft <option-id>|[target]
/dms equipment assign <equipment-id>|<target>
/dms portal anchors
/dms portal routes
/dms portal <open|close|travel> <anchor-or-route-id>

/dms soldiers recruit <Archetype>|<count>|[Barracks room-id]
/dms location <Dungeon|Lustria|Homeworld|Secondary>|[secondary]|[detail]
/dms mode <Mode>|<Targets,...>|<Pace>
/dms scout [sector name]
/dms vein target <extraction room-id>|<vein-id>
/dms sector secure <sector-id>
/dms sector conquer <sector-id>

/dms quest add personal <Title>|<Objective>|[Reward resource]
/dms quest complete <quest-id>
/dms quest status
/dms help
```

Legacy/manual setup example:

```text
/dms setup Mara|Voidkin|The Ashen Court|Volcanic necromancy|Gothic basalt fortress|masked ashbound skeletons|ember-wreathed revenants|Caelus|The Crossroads
/dms resource define construction|Graveglass|Black volcanic crystal shot through with soul-light.|Quarried from cooling ossuary flows.|Shapes rooms and fortifications.
```

## AI Dungeon installation

Copy each root script into the matching AI Dungeon tab:

- `Library.js` contains Toolbox, Inner Self/Auto-Cards, and DMS.
- `Input.js`, `Context.js`, and `Output.js` invoke the shared lifecycle.
- `DMS Scenario Setup Story Cards.json` supplies the pre-opening character-creation questions. Reusing the exact same `${question}` text in the Opening or Plot Essentials reuses the same answer.

Do not install separate copies of Toolbox, Inner Self, or Auto-Cards; duplicate installations would compete for state and Story Card ownership.

Plot Essentials is maintained as a compact Player/Dungeon status sheet with ability names but not full Skill or Trait descriptions. Author's Note is maintained as the current Activity State. Both use delimited DMS blocks, so unrelated scenario text is preserved.

## Validation

```text
npm run check
```

See [the architecture](docs/ARCHITECTURE.md) for the domain model and full development map.
Use [the Tier 0 testing guide](docs/TIER_0_TESTING.md) for the player-path and cache-recovery acceptance checks.
