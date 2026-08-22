# Dungeon Management System architecture

The Dungeon Management System uses Aetheria's AI Dungeon file structure. All three runtime layers are contained in the root `Library.js`; the three hook files only invoke the shared lifecycle.

1. **Toolbox** coordinates commands, context filtering, output cleanup, and optional narrative tools.
2. **Inner Self and Auto-Cards** provide persistent minds and memories for Administrators and important dungeon inhabitants.
3. **DMS Core** is the sole mechanical authority for the Tronebound, Dungeon, Administrators, Rooms, Activity Mode, quests, statistics, and deterministic generation decisions.

Narration may describe managed changes, but it cannot decide or overwrite them. The input hook plans or executes a valid change, the context hook tells the model what has already been established, and the output hook presents or commits the managed result.

## Authoritative records

### Tronebound

The mostly user-authored player character bound to the dungeon. Its record owns identity, level, stats, permissions, bonds, and personal quests. The engine should avoid inventing identity details the user has not supplied.

### Dungeon

The parent identity and economy. Theme, style, and population are user-defined seeds. Every generated room, Administrator, inhabitant, hazard, resource, reward, and aesthetic feature must derive from them. Later configuration can extend these seeds explicitly; ordinary narration cannot silently replace them.

### Administrators

Named, individually tracked agents with roles, loyalty, goals, room assignments, memories, and plans. Administrators are the primary Inner Self agents. Their duties are mechanically constrained while their personalities remain narratively expressive.

### Rooms

Individually identified dungeon spaces with purpose, state, level, features, population, assigned Administrator, connections, production, defenses, and discovered history. Generation is deterministic for the same dungeon identity and sequence.

## Adapted Aetheria systems

| Aetheria foundation | Dungeon adaptation |
| --- | --- |
| Player/party character tracking | Tronebound and Administrator sheets |
| Activity Mode | Survey, Construction, Administration, Recruitment, Defense, and System |
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

The first implementation includes deterministic Room and Administrator generation. Population members, encounters, resources, hazards, rewards, connections, and room upgrades are the next domain modules.
