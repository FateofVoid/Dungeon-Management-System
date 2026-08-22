# Dungeon Management System

A theme-driven AI Dungeon management layer centered on the **Thronebound**: the player character mystically bound to a growing dungeon.

The user defines the dungeon's theme, style, and population. DMS then uses those constraints to create and track Rooms, Administrators, inhabitants, facilities, hazards, resources, rewards, and quests without allowing ordinary AI narration to overwrite mechanical state.

## Current foundation

- Toolbox v2.0 and Inner Self v1.0.2/Auto-Cards vendor baseline
- Ten Dungeon Tiers controlling Administrator Capacity, Room Capacity, room upgrades, and Class Tiers
- Four fully user-defined theme resources: construction, sustenance, character development, and dungeon energy
- Scripted Room functions with theme-generated Appearance, Function, and Job lore
- Worker jobs, Soldier archetypes, room-derived capacities, production, upkeep, and Combat Power
- Thronebound and Administrator levels, Classes, Class Tiers, Attributes, Skills, and Traits
- Location-aware Activity Mode covering the Dungeon, Lustria, Homeworld, and an optional secondary location
- Lustrian sector scouting, resource-vein discovery, combat gating, extraction targeting, and Cycle production
- Managed global Lustria lore that excludes Eryndral and story-specific characters or dungeons
- Managed quest chain and System Cards
- Silent-author `/dms` command routing
- Aetheria-compatible root `Library.js`, `Input.js`, `Context.js`, and `Output.js` structure
- GitHub Codespaces development environment

## Develop from any computer

Open the repository on GitHub, choose **Code → Codespaces → Create codespace on main**. The container automatically validates the monolithic scripts and runs the tests. No local IDE is required.

## Commands

```text
/dms setup <Thronebound>|<Race>|<Class>|<Dungeon>|<Theme>|<Style>|<Workers>|<Soldiers>|<Homeworld>|[Secondary location]
/dms resource define <construction|sustenance|development|energy>|<Name>|<Description>|<Collection>|<Use>
/dms attribute unique <Name>|<Description>|<Value>
/dms status
/dms dungeon upgrade
/dms room list
/dms room build <function-key>
/dms room upgrade <room-id>
/dms administrator add <Name>|<Race>|<Class>|<combat|support>
/dms workers recruit <count>
/dms workers assign <room-id>|<count>
/dms soldiers recruit <Archetype>|<count>|[Barracks room-id]
/dms class evolve <target>|<Skill>|<Skill description>|<Trait>|<Trait description>
/dms skill buy <target>|<Name>|<Description>|<Development cost>
/dms location <Dungeon|Lustria|Homeworld|Secondary>|[secondary]|[detail]
/dms mode <Mode>|<Targets,...>|<Pace>
/dms scout [sector name]
/dms vein target <extraction room-id>|<vein-id>
/dms sector secure <sector-id>
/dms sector conquer <sector-id>
/dms cycle
/dms quest status
/dms help
```

Example:

```text
/dms setup Mara|Voidkin|Ash Sovereign|The Ashen Court|Volcanic necromancy|Gothic basalt fortress|masked ashbound skeletons|ember-wreathed revenants|Caelus|The Crossroads
/dms resource define construction|Graveglass|Black volcanic crystal shot through with soul-light.|Quarried from cooling ossuary flows.|Shapes rooms and fortifications.
```

## AI Dungeon installation

Copy each root script into the matching AI Dungeon tab:

- `Library.js` contains every runtime component: Toolbox, Inner Self/Auto-Cards, and DMS.
- `Input.js`, `Context.js`, and `Output.js` are the minimal lifecycle hooks.

Do not install separate copies of Toolbox, Inner Self, or Auto-Cards; doing so would duplicate their state and story-card ownership.

## Test

```text
npm run check
```

See [the architecture](docs/ARCHITECTURE.md) for the domain model and adaptation plan.
