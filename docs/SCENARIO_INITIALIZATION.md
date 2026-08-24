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

The final Continue returns the original Scenario Generator's copyable `story_bible` JSON object. The main DMS Library contains the adapter: it resolves dynamically named Dungeon and Thronebound sections using the generator's own punctuation rules, accepts both `kink_content` and the `fetish_content` label used by policy levels 6–10, strips any generator guidance accidentally appended to a field, and validates the result as canonical `DMS_INIT` version 3 before changing Tier 0 state. Its narrative content includes the Thronebound profile, Dungeon atmosphere and manifestation, shared population form and appearance, four resource definitions, and detailed Homeworld context. Workers and Soldiers do not receive separate appearance definitions; cohorts and Administrators adapt the shared population foundation.

## 2. Thronebound Awakening

Import root `Library.js`, the three root hooks, and `DMS Scenario Setup Story Cards.json` into the main scenario. It has exactly one character-creation question:

> Paste the complete DMS Initialization JSON String produced by the Dungeon Generator.

DMS accepts the Dungeon Generator's `story_bible` object directly, canonical `DMS_INIT` version `3`, and complete legacy version `1` or `2` objects. It validates the canonical result before mutation and imports only into pristine Tier 0 state. Invalid or incomplete JSON cannot partially initialize the Dungeon. The canonical object's stable hash is saved, so retries cannot duplicate initialization, rooms, quests, resources, or rewards.

The pasted JSON is a one-use handoff rather than persistent Plot context. After a successful import, DMS replaces the entire character-creation field with its readable `[DMS PLOT ESSENTIALS]` status sheet. The raw JSON is not retained in Plot Essentials; its authoritative values live in runtime state, focused Lore/System Cards, Author's Note, and save cards according to the context architecture.

Major Activity locations accept either their category or their configured proper name. `Homeworld` or the Homeworld name injects description, region, time period, and current circumstances; the Primary Anchor or Residence is added only when Secondary Location explicitly selects it. `Lustria` injects only the designated Nexus Realm location foundation. `Dungeon` or the Dungeon name injects the Dungeon description and manifestation, plus the current constructed room when Secondary Location resolves to one. No location path scans narration or Activity targets for apparently relevant Lore Cards.

Long narrative details are written to separate compact Lore Cards rather than mechanical save cards. Natural cards preserve the Dungeon foundation, Thronebound character, individual resource definitions, Unique Attribute descriptions, Homeworld foundation and anchor, and constructed rooms. Identity and scenario guidance may be duplicated in hidden System Cards for recovery. Mechanical save cards retain only state that cannot otherwise be recovered.

## Attribute ownership

Thronebound Combat and Support Attributes grow on Thronebound Level Up. Each independently selects one of the five outcomes for its Aptitude. A favored standard Attribute gains an additional +1.

Unique Attributes belong to the Thronebound and have effects that influence the Dungeon. The Primary Attribute is required; Secondary and Tertiary Attributes are optional. Their names cannot duplicate Might, Agility, Endurance, Arcana, Command, Logistics, Insight, or Craft. Their priority weights their contribution to broad Dungeon functions, Dungeon Signature, and Administrator affinity. They roll their Aptitude outcomes on Thronebound Level Up; a favored Unique Attribute receives the same additional +1 as a favored standard Attribute.

Growth Preferences may contain one to five exact names drawn from the eight standard Attributes and the generated Thronebound Unique Attributes.

## Initial Plot Essentials

Plot Essentials contains a readable status sheet, not the JSON or its long character-creation placeholder. It continuously includes Thronebound identity and Appearance, all Attributes, progression and ability names, Dungeon identity, population, Signature, current stocks, and facility state. Author's Note continuously preserves the Generator's exact sexual-content value, kink-content value, and tags above Activity State. Narrative descriptions remain in focused, naturally triggered Lore Cards as specified by [the context architecture](CONTEXT_ARCHITECTURE.md).

## Regression fixture

`test/fixtures/dungeon-generator-sample.json` is the frozen Queen's Vault compatibility output for all future scenario-generation testing. It deliberately uses punctuation in the Dungeon and Thronebound names, the generator's `fetish_content` field, three nonstandard Unique Attributes, and every Homeworld context field. Its checksum is asserted so the finalized Generator contract cannot drift accidentally.

`test/dms-json-playthrough.test.cjs` imports that fixture through the same initialization adapter used by AI Dungeon, completes Tier 0 through natural System requests, develops the Tier 1 economy and facilities, fills Administrator Capacity, selects a Class, purchases abilities, earns the Tier 2 reserve through production, and verifies persistence recovery. It then invokes the Tier 2 upgrade boundary and confirms that Release A's verified-Tier deployment gate still prevents entry into unverified Tier 2 gameplay.
