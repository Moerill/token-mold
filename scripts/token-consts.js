export default class TokenConsts {

  /**
   * All systems that support either rolling for HP or scaling token sizes
   * @internal
   */
  static SUPPORTED_SYSTEMS = Object.freeze(["dnd5e", "pf2e", "sfrpg", "sw5e", "dcc"]);
  // not sure about sfrpg - should that be listed?

  /**
   * Subset of systems that support rolling for HP
   * @internal
   */
  static SUPPORTED_ROLLHP = Object.freeze(["dnd5e", "sw5e", "dcc"]);

  /**
   * Subset of systems that support scaling token sizes
   * @internal
   */
  static SUPPORTED_CREATURESIZE = Object.freeze(["dnd5e", "pf2e"]);

  /**
   * Subset of systems that have 5E skills
   * @internal
   */
  static SUPPORTED_5ESKILLS = Object.freeze(["dnd5e", "sw5e"]);

  /**
   * All the language supported for name generation
   * @internal
   */
  static LANGUAGES = Object.freeze([
    "afrikaans",
    "albanian",
    "armenian",
    "azeri",
    "croatian",
    "czech",
    "danish",
    "dutch",
    "english",
    "estonian",
    "finnish",
    "french",
    "georgian",
    "german",
    "greek",
    "hungarian",
    "icelandic",
    "indonesian",
    "irish",
    "italian",
    "latvian",
    "lithuanian",
    "norwegian",
    "polish",
    "portuguese",
    "romanian",
    "russian",
    "sicilian",
    "slovak",
    "slovenian",
    "spanish",
    "swedish",
    "turkish",
    "welsh",
    "zulu",
  ]);

  static DND_DEFAULT_NAME_OPTIONS = Object.freeze({
    default: "random",
    attributes: [
      // Various named monsters
      {
        attribute: "name",
        languages: {
          orc: "turkish",
          goblin: "indonesian",
          kobold: "norwegian",
        },
      },
      // Uncomment this section if races get implemented in FVTT
      // {
      //     attribute: "system.details.race",
      //     languages: {
      //         "dragonborn": "norwegian",
      //         "dwarf": "welsh",
      //         "elf": "irish",
      //         "halfling": "english",
      //         "half-elf": "finnish",
      //         "half-orc": "turkish",
      //         "human": "english",
      //         "gnome": "dutch",
      //         "tiefling": "spanish",
      //     }
      // },
      // NPC Types
      {
        attribute: "system.details.type.value",
        languages: {
          humanoid: "irish",
          aberration: "icelandic",
          beast: "danish",
          celestial: "albanian",
          construct: "azeri",
          dragon: "latvian",
          elemental: "swedish",
          fey: "romanian",
          fiend: "sicilian",
          giant: "german",
          monstrosity: "slovenian",
          ooze: "welsh",
          plant: "zulu",
          undead: "french",
        },
      },
    ],
  });

}
