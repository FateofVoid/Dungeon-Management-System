# Dungeon Management System

A theme-driven AI Dungeon management layer centered on the **Tronebound**: the player character mystically bound to a growing dungeon.

The user defines the dungeon's theme, style, and population. DMS then uses those constraints to create and track Rooms, Administrators, inhabitants, facilities, hazards, resources, rewards, and quests without allowing ordinary AI narration to overwrite mechanical state.

## Current foundation

- Toolbox v2.0 and Inner Self v1.0.2/Auto-Cards vendor baseline
- Managed Tronebound, Dungeon, Administrator, and Room records
- Deterministic theme-constrained Room and Administrator generation
- Adapted Activity Mode and management Cycles
- Initial managed quest chain
- Silent-author `/dms` command routing
- AI Dungeon `Input.js`, `Context.js`, `Output.js`, and bundled `Library.js` build
- GitHub Codespaces development environment

## Develop from any computer

Open the repository on GitHub, choose **Code → Codespaces → Create codespace on main**. The container automatically runs the build and tests. No local IDE is required.

## Commands

```text
/dms setup <Tronebound>|<Dungeon>|<Theme>|<Style>|<Population,...>
/dms status
/dms room generate [Role]
/dms administrator add [Name]|[Role]
/dms mode <Mode>|<Targets,...>|<Pace>
/dms quest status
/dms help
```

Example:

```text
/dms setup Mara|The Ashen Court|Volcanic necromancy|Gothic fortress|skeletons, ember wraiths
```

## Build and test

```text
npm run check
```

Copy the generated files from `dist/` into the corresponding AI Dungeon script tabs. See [the architecture](docs/ARCHITECTURE.md) for the domain model and adaptation plan.
