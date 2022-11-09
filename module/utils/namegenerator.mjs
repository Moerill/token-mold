export class NameGenerator {

    //TODO - Update this to be able to be setup manually
    static dndDefaultNameOptions() {
        return {
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
                //     attribute: TokenMold.FOUNDRY_VERSION >= 10 ? "system.details.race" :"data.details.race",
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
                    attribute: TokenMold.FOUNDRY_VERSION >= 10 ? "system.details.type" : "data.details.type",
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
        };
    }
}