# DMS Dungeon Generator

This folder is a separate AI Dungeon scenario package. Import its `Library.js`, `Input.js`, `Context.js`, `Output.js`, `Opening.txt`, and Story Cards into a scenario named **Dungeon Generator**. Do not combine these scripts with the Thronebound Awakening runtime.

The player supplies four opening inputs: Dungeon and Thronebound Details, Optional Tags, Sexual Content, and Kink Content. The generator then follows eight focused sections and produces the official Scenario Generator's nested JSON output. The player copies that complete object into the sole character-creation input of the main **Thronebound Awakening** scenario.

The generator may invent unspecified details, including the origin world, while preserving anything the player explicitly supplied. It creates one required Primary Unique Dungeon Attribute and may add a Secondary and Tertiary Attribute. Their priority determines relative mechanical influence; their names, descriptions, Aptitudes, and Growth Preference links remain theme-specific.

The package uses [Scenario Generator v2.0](https://github.com/FaraC-scripts/Scenario-Generator-2) by FaraC as its official Library, with DMS adaptations that show player-guide comments in the story before each section and dynamically rename `Dungeon Template` and `Character Template` to the generated Dungeon and Thronebound names.
