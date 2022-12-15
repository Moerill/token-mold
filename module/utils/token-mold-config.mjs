import { TokenMoldConfigurationDialog } from "../forms/token-mold-configuration-dialog.mjs";

export class TokenMoldConfig {
    #key = "";
    #isLocked = true;

    localizeKey = true;
    active = false;
    config = {
        prototypeTokenLinked: true,
        disposition: null,
        name: null,
        custom: null
    };

    unlinkedOnly = true;
    name = {
        use: true,
        number: {
            use: true,
            prefix: " (",
            suffix: ")",
            type: "ar",
        },
        remove: false,
        prefix: {
            use: true,
            position: "front",
            table: "Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ", // English
        },
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
        baseNameOverride: false,
    };
    hp = {
        use: true,
        toChat: true,
    };
    size = {
        use: true,
    };
    config = {
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
        use: true,
        attrs: TokenMoldConfigurationDialog.defaultAttrs,
    };

    constructor({key = "Unlinked", localize = true, active = true, isLocked = false}) {
        this.#key = key;
        this.localizeKey = localize;
        this.active = active;
        this.#isLocked = isLocked;
    }

    get key() {
        return game.i18n.localize(`TOKEN-MOLD.CONFIG.${this.#key}`);
    }

    get locked() {
        return this.#isLocked;
    }

    cloneFromSettings(settings) {
        if (settings.name) { this.name = settings.name; }
        if (settings.hp) { this.hp = settings.hp; }
        if (settings.size) { this.size = settings.size; }
        if (settings.config) { this.config = settings.config; }
        if (settings.overlay) { this.overlay = settings.overlay; }
    }
}