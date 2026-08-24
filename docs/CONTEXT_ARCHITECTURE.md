# DMS context architecture

DMS separates continuous context, normally triggered lore, and non-narrative storage. Script-selected context is legal only when authoritative DMS state or a controlled generation operation selects exact fields. Narration is never scanned to infer relevance.

## Information classes

### Plot Essentials

Always present:

- Thronebound name, Race, Gender, Appearance, and Voice Pattern;
- Combat, Support, and Unique Attributes as `Name (Aptitude): Value`;
- Level, Experience, Class, Class Tier, Class lineage, Growth Preferences, Skill names, and Trait names;
- Dungeon name, Theme, Style, Population name, Homeworld name, and Concept;
- Dungeon Tier, Administrator count/Capacity, Worker and Soldier totals, Dungeon Signature, current resource and currency stocks, and compact facility state.

Plot does not repeat Attribute descriptions, ability descriptions, resource definitions, population appearance, or Homeworld narrative fields.

### Author's Note

Always present, without summaries or reinterpretation:

- the Generator's exact `sexual_content` value;
- the Generator's exact `kink_content` value, including adapted `fetish_content` input;
- the exact ordered tags;
- Major Location, Secondary Location, location detail, Activity Mode, targets, Pace, Cycle, and progress.

### Lore Cards

Normal AI Dungeon Story Cards with natural trigger keys:

- Thronebound Character: Personality, Background, Capabilities, Values;
- Dungeon Foundation: Description, Manifestation, Population Appearance;
- one separate card for each of Construction, Sustenance, Development, and Energy resource definitions;
- Unique Attribute Lore: exact descriptions only;
- Homeworld Foundation: Description, Region, Time Period;
- Homeworld Anchor: Primary Anchor, Residence, Current Circumstances;
- every constructed Dungeon Room, including the Throne Room;
- global Lustria foundation cards.

DMS does not inject these cards because narration mentions a subject, combat occurs, a character seems emotional, an object resembles a resource, or the model names a place. AI Dungeon's native trigger system owns those decisions.

### System Cards

Hidden or status-oriented storage used for persistence, validation, mechanics, recovery, and player UI. System Cards may duplicate any required field. Their managed trigger keys are not narrative triggers, and DMS context selection never scans them.

## Deterministic story-turn injection

| Authoritative condition | Exact injected fields |
| --- | --- |
| Major Location = Dungeon | Dungeon Description and Manifestation |
| Major Location = Homeworld | Description, Region, Time Period, Current Circumstances |
| Major Location = Lustria | designated Nexus Realm location foundation |
| Major = Dungeon and Secondary resolves to a constructed room | current room State, Tier, Expansion, Appearance, Function, Job, Throne Authority, and work assignment |
| Secondary = Throne Room | the same current Throne Room context |
| Secondary = Homeworld Primary Anchor or its exact generated value | Primary Anchor |
| Secondary = Homeworld Residence or its exact generated value | Residence |

Activity targets do not select Lore Cards. If AI Dungeon exposes reliable activated-card metadata in the future, duplication may be reduced without weakening authoritative location context.

## Controlled generation

`controlledGenerationContext` assembles separate structured input for DMS-owned AI operations:

- Administrator generation receives Theme, Style, Population, Population Appearance, Unique Attribute descriptions, role, Rank, and relevant room function;
- room generation receives Theme, Style, Manifestation, Unique Attribute descriptions, fixed room Function, relevant resource definition, and Tier;
- Class generation receives capabilities, current lineage, Theme, Unique Attribute descriptions, Aptitudes, Growth Preferences, and Tier;
- quest generation receives category, authoritative location, current progression, and explicitly supplied related facts.

These builders do not inspect current narration or copy unrelated fields such as Homeworld lore into Administrator generation.

## Throne Room invariants

The Throne Room is a constructed room record whose Tier always equals Dungeon Tier. It cannot be upgraded independently. Its initial Appearance is the exact Generator `throne_room` value; later Tier presentation preserves that original form while recording its development.

The first Manager has permanent Throne Room authority through `authorityAdministrator`. A later functional `assignedAdministrator` or Manager work assignment is separate and does not revoke the Manager role. The Throne Room has no starting Worker cohort; a theme-defined attendant cohort may be introduced only when a later system makes it mechanically meaningful.
