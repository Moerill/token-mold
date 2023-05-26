import { TokenMoldConfigurationDialog } from "../forms/token-mold-configuration-dialog.mjs";

export class TokenMoldRuleConfig {
    id = null;
    configName = "Default Config";

    name = {
        adjective: {
            use: false,
            position: "front",
            table: "Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ" // English
        },
        number: {
            use: true,
            prefix: "(",
            suffix: ")",
            type: "ar",
        },
        remove: false,
        replace: "",
        options: {
            default: "random",
            attributes: [
                {
                    attribute: "",
                    languages: {
                        "": "random",
                    },
                },
            ],
            min: 3,
            max: 9,
        },
        prefix: {
            addCustomWord: false,
            addAdjective: true,
            customWord: "The",
            table: "Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ" // English
        },
        suffix: {
            addCustomWord: false,
            addAdjective: false,
            customWord: "the",
            table: "Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ" // English
        },
        baseNameOverride: false,
    };
    hp = {
        use: true,
        toChat: true,
        ruleSet: null
    };
    size = {
        use: true,
    };
    properties = {
        use: false,
        vision: {
            use: false,
            value: true,
        },
        displayBars: {
            use: false,
            value: 40,
        },
        bar1: {
            use: false,
        },
        bar2: {
            use: false,
        },
        displayName: {
            use: false,
            value: 40,
        },
        disposition: {
            use: false,
            value: 0,
        },
        rotation: {
            use: false,
            min: 0,
            max: 360,
        },
        scale: {
            use: false,
            min: 0.8,
            max: 1.2,
        },
    };
    overlay = {
        use: false,
        attrs: TokenMoldConfigurationDialog.defaultAttrs,
    };

    constructor(defaults = {}) {
        mergeObject(this, defaults, {insertKeys: false});
        if (!this.id) { this.id = foundry.utils.randomID(); }
    }
}
