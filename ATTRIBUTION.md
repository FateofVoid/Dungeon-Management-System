# Attribution

This project incorporates and adapts the following open-source AI Dungeon scripts inside the root `Library.js`:

- **Toolbox v2.0**, by FaraC — [Toolbox Standalone](https://github.com/FaraC-scripts/Toolbox-Standalone), MIT License.
- **Inner Self v1.0.2**, by LewdLeah — [Inner Self](https://github.com/LewdLeah/Inner-Self), MIT License.
- The integrated Auto-Cards code distributed with Inner Self/Toolbox.

The vendor baseline was imported from FateofVoid's Aetheria Project integration. Aetheria's MASS domain layer is not copied into DMS; its validated lifecycle and deterministic-management patterns are adapted for the dungeon domain in the DMS section of `Library.js`.

The separate `dungeon-generator/` scenario adapts the guided outline and final JSON handoff concept from **Scenario Generator v2.0**, by FaraC — [Scenario Generator v2.0](https://github.com/FaraC-scripts/Scenario-Generator-2), MIT License. Its implementation and DMS initialization schema are purpose-built for this project.
