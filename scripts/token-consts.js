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
}