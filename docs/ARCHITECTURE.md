# Dungeon Management System architecture

The Dungeon Management System uses Aetheria's AI Dungeon file structure. All three runtime layers are contained in the root `Library.js`; the three hook files only invoke the shared lifecycle.

1. **Toolbox** coordinates commands, context filtering, output cleanup, and optional narrative tools.
2. **Inner Self and Auto-Cards** provide persistent minds and memories for Administrators and important dungeon inhabitants.
3. **DMS Core** is the sole mechanical authority for the Thronebound, Dungeon, Administrators, Rooms, Activity Mode, quests, statistics, and deterministic generation decisions.

Narration may describe managed changes, but it cannot decide or overwrite them. The input hook plans or executes a valid change, the context hook tells the model what has already been established, and the output hook presents or commits the managed result.

## Authoritative records

### Thronebound

The mostly user-authored player character bound to the dungeon. Its record owns Name, Race, Level, Class, Class Tier, Combat Attributes, Support Attributes, theme-defined Unique Attributes, Skills, and Traits. Schema migration accepts the prototype `tronebound` key but stores the canonical `thronebound` key.

### Dungeon

The parent identity and economy. Theme, style, Worker description, Soldier description, and four resources are user-defined seeds. The four purposes are always Construction, Sustenance, linked-character Development, and Dungeon Energy even though their names and lore differ by dungeon. Ten Dungeon Tiers control Administrator Capacity, Room Capacity, maximum Room Tier, maximum Class Tier, and facility unlocks.

### Administrators

Named, individually tracked agents with Race, Level, Class, Class Tier, Skills, Traits, and either the Combat or Support Attribute set. Administrator Capacity equals Dungeon Tier. Administrators are the primary Inner Self agents; their duties are mechanically constrained while their personalities remain narratively expressive.

### Rooms

Individually identified facilities without mandatory coordinates or layout. Scripted definitions decide unlock Tier, costs, production, capacity, bonuses, and other backend functions. Generated Appearance, Function, and Job lore expresses that fixed function through the user's theme and style. A Room cannot exceed the Dungeon Tier. Worker assignments inherit the Room's Job and Tier.

### Population

Population is cohort-based, never individually simulated. Worker Capacity and Soldier Capacity are derived from built Rooms and their upgrade Tiers. Worker assignments drive production; unique-worker facilities require one operator and scale mainly from Room Tier. Soldiers unlock through Barracks, use fixed combat archetypes, inherit their Barracks Tier, and produce Combat Power used for defense and Lustrian access.

### Lustria and locations

Activity state records a major location—Dungeon, Lustria, Homeworld, or the configured optional Secondary location—plus secondary and detailed location text. The private Dungeon System is available only in the Dungeon's Throne Room; `/dms` remains a silent author command everywhere.

Scout facilities deterministically discover Lustrian sectors and resource sites. Sector threat is compared with Dungeon Combat Power. Vein Extraction Facilities target discovered sites; their Tier controls extraction rate and concurrent targets. Extracted Lustrian resources are separate from the four dungeon-theme resources.

## Adapted Aetheria systems

| Aetheria foundation | Dungeon adaptation |
| --- | --- |
| Player/party character tracking | Thronebound and Administrator sheets |
| Activity Mode | Location-aware Travel, Survey, Construction, Administration, Production, Training, Recruitment, Defense, Exploration, Exploitation, and System |
| Managed quests | Dungeon foundation, expansion, Administrator, room, defense, and Tronebound quest families |
| `/mass` commands | Silent-author `/dms` commands |
| System voice windows | Private dungeon status and management interfaces while in System Mode |
| Character and System cards | Tronebound, Dungeon, Administrator, Room, Activity, Quest, and Log cards |
| Deterministic action planning | Validate costs and outcomes before narration; output wording is never mechanical authority |

## Generation contract

Generation consumes an explicit dungeon identity plus a stable sequence number. Generated records must:

- retain the configured theme and style;
- select population only from configured groups or explicit later additions;
- state their functional dungeon role;
- remain stable across retries;
- create a managed record before the narrative model describes the result;
- never alter the Tronebound's user-authored identity.

The current implementation includes deterministic room lore, Tier upgrades, themed resources, production Cycles, character progression, population cohorts, Combat Power, location tracking, Lustrian scouting, resource sites, and extraction.
