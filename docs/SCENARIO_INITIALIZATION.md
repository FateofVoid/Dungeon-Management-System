# DMS scenario initialization

DMS uses two separate AI Dungeon scenario choices. The parent **Multiple Choice** Opening description explains those choices:

> Choose how you want to begin. Dungeon Generator creates a complete initialization JSON from a concept and optional boundaries. Thronebound Awakening starts the adventure using a completed initialization JSON.

## 1. Dungeon Generator

Import the four scripts and Story Cards from `dungeon-generator/` into a scenario named **Dungeon Generator**. Its character creation card asks exactly four questions:

```text
DMS Player Input
> Dungeon and Thronebound Details: ${Describe the Dungeon and Thronebound, including any details you want preserved about their theme, appearance, population, character, or origin world. Leave anything unspecified for the Dungeon Generator to create.}
> Optional Tags: ${Optionally provide tags that should guide the Dungeon Generator, separated by commas. Leave blank to generate them.}
> Sexual Content: ${Enter a number from 0 to 10 for the desired sexual-content level.}
> Kink Content: ${Enter a number from 0 to 10 for the desired kink or fetish-content level.}
```

The generator preserves supplied facts, creates coherent missing details, and progresses through eight editable sections by pressing Continue. Player-readable `//` guidance appears in the story immediately before each new section and is excluded from generator context and final JSON:

1. Overview
2. Dungeon Template
3. Dungeon Resources
4. Character Template
5. Unique Attributes
6. Aptitudes
7. Attribute Growth Preference
8. Homeworld

The final Continue returns the original Scenario Generator's copyable `story_bible` JSON object. The main DMS Library contains the adapter: it resolves the dynamically named Dungeon and Thronebound sections, strips any generator guidance accidentally appended to a field, and validates the result as canonical `DMS_INIT` version 2 before changing Tier 0 state. Its narrative content includes the Thronebound profile, Dungeon atmosphere and manifestation, shared population form and appearance, four resource definitions, and detailed Homeworld context. Workers and Soldiers do not receive separate appearance definitions; cohorts and Administrators adapt the shared population foundation.

## 2. Thronebound Awakening

Import root `Library.js`, the three root hooks, and `DMS Scenario Setup Story Cards.json` into the main scenario. It has exactly one character-creation question:

> Paste the complete DMS Initialization JSON String produced by the Dungeon Generator.

DMS accepts the Dungeon Generator's `story_bible` object directly, canonical `DMS_INIT` version `2`, and complete legacy version `1` objects. It validates the canonical result before mutation and imports only into pristine Tier 0 state. Invalid or incomplete JSON cannot partially initialize the Dungeon. The canonical object's stable hash is saved, so retries cannot duplicate initialization, rooms, quests, resources, or rewards.

Major Activity locations accept either their category or their configured proper name. `Homeworld` or the Homeworld name loads the generated Homeworld foundation, region, return anchor, residence, and current circumstances. `Lustria` loads Lustria's global foundation while treating the Thronebound as away from the Dungeon. `Dungeon` or the Dungeon name loads both the Dungeon-specific foundation and Lustria's global foundation because the active Dungeon is situated in Lustria.

Long narrative details are written to separate compact lore Story Cards rather than the mechanical save cards. These cards preserve the Dungeon foundation, Thronebound identity and character, Homeworld foundation and anchor, and scenario guidance. Mechanical save cards retain only state that cannot otherwise be recovered.

## Attribute ownership

Thronebound Combat and Support Attributes grow on Thronebound Level Up. Each independently selects one of the five outcomes for its Aptitude. A favored standard Attribute gains an additional +1.

Unique Dungeon Attributes belong to the Dungeon. The Primary Attribute is required; Secondary and Tertiary Attributes are optional. Their priority weights their contribution to broad Dungeon functions, Dungeon Signature, and Administrator affinity. They grow on Dungeon Tier Up using their own Aptitude rolls, and a favored Unique Attribute gains an additional +1 at that time.

Growth Preferences may contain one to five exact names drawn from the eight standard Attributes and the generated Unique Dungeon Attributes.

## Initial Plot Essentials

Plot Essentials contains a readable status sheet, not the JSON or its long character-creation placeholder. DMS replaces the managed block with resolved live state on the first lifecycle sync. Detailed appearance, background, resource lore, and Homeworld information remain in focused Story Cards so Plot Essentials stays compact.
