import { log } from "./util.js";
import ConfigMold from "./config-mold.js";

export default class TokenMold {
  static init() {
    let mold = new TokenMold();
    Hooks.callAll("token-mold.Setup", mold);
    console.log(
      " _____     _               ___  ___      _     _ \r\n|_   _|   | |              |  \\/  |     | |   | |\r\n  | | ___ | | _____ _ __   | .  . | ___ | | __| |\r\n  | |/ _ \\| |/ / _ \\ '_ \\  | |\\/| |/ _ \\| |/ _` |\r\n  | | (_) |   <  __/ | | | | |  | | (_) | | (_| |\r\n  \\_/\\___/|_|\\_\\___|_| |_| \\_|  |_/\\___/|_|\\__,_|\n--------------------- Ready ---------------------"
    );

    Hooks.on("preCreateToken", mold.applyMold.bind(mold));
  }

  applyMold(tokenDocument, tokenData, options, userId) {
    ConfigMold.applyMold(tokenData);
  }

  get modificationOptions() {
    return {
      Roll: {
        formula: "String",
      },
      Attribute: {
        source: "String",
      },
      Number: {
        value: "Number",
      },
      String: {
        value: "String",
      },
      Increment: {
        // State that only for currently created tokentype (based on actor),
        type: ["Arabic", "Alphanumeric Upper", "Alphanumeric Lower", "Roman"],
      },
      RollTable: {
        // remember to preload for all active molds!
        uuid: "Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ",
      },
      StringGenerator: {
        // ????
        values: [
          // List of modification Options, will be just joined as String
        ],
      },
    };
  }

  get defaultMolds() {
    return [
      {
        name: "Name",
        active: true,
        default: {
          modifications: {
            name: {
              type: "StringGenerator",
              value: [],
            },
          },
        },
      },
      {
        name: "HP rolling",
        systems: ["dnd5e"],
        active: true,
        default: {
          modifications: {
            "actorData.data.attributes.hp.max": {
              type: "Roll",
              formula: "@attributes.hp.formula",
            },
            "actorData.data.attributes.hp.value": {
              type: "Attribute",
              source: "actor.data.data.attributes.hp.formula",
            },
          },
        },
      },
    ];
  }
}
