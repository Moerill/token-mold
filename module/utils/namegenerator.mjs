import { Logger } from "../logger/logger.mjs";
import { CONFIG } from "../config.mjs";
import { TokenMoldRuleConfig } from "../models/token-mold-rule-config.mjs";

export class TokenMoldNameGenerator {
    static GenerateNameFromRuleConfig(actor, ruleConfig, sceneID, shiftOverride) {
        Logger.debug(false, "Generating Name", actor, ruleConfig, shiftOverride, CONFIG);

        const nameConfig = ruleConfig.name;
        let name = actor.prototypeToken.name;

        if (["remove", "replace"].includes(nameConfig.replace) && !(nameConfig.baseNameOverride && shiftOverride)) {
            name = "";
        }

        if (nameConfig.replace === "replace") {
            name = TokenMoldNameGenerator.#GenerateNewName(actor, ruleConfig);
        }

        let namePrefix = "";
        if (nameConfig.prefix.addCustomWord) { namePrefix = nameConfig.prefix.customWord; }
        if (nameConfig.prefix.addAdjective) { namePrefix += ` ${TokenMoldNameGenerator.#GetAdjective(nameConfig.prefix.table)}`; }

        if (namePrefix.length > 0) { name = `${namePrefix} ${name}`.trim(); }

        if (nameConfig.suffix.addCustomWord) { name += ` ${nameConfig.suffix.customWord}`; }
        if (nameConfig.suffix.addAdjective) { name += ` ${TokenMoldNameGenerator.#GetAdjective(nameConfig.suffix.table)}`; }
        if (nameConfig.number.use) {
            let numberSuffix = "";
            let number = 0;

            // Check if number in session database
            if (CONFIG.COUNTERS[sceneID][actor.id] !== undefined) {
                number = CONFIG.COUNTERS[sceneID][actor.id];
            } else {
                // Extract number from last created token with the same actor ID
                const sameTokens = game.scenes.get(sceneID).tokens.filter((e) => e.actorId === actor.id);
                if (sameTokens.length !== 0) {
                    const lastTokenName = sameTokens[sameTokens.length - 1].name;
                    // Split by prefix and take last element
                    let tmp = lastTokenName.split(nameConfig.number.prefix).pop();
                    if (tmp !== "") {
                        // Split by suffix and take first element
                        number = tmp.split(nameConfig.number.suffix)[0];
                    }
                }
            }

            // Convert String back to number
            switch (nameConfig.number.type) {
                case "ar":
                    number = parseInt(number);
                    break;
                case "alu":
                    number = TokenMoldNameGenerator.#Dealphabetize(number.toString(), "upper");
                    break;
                case "all":
                    number = TokenMoldNameGenerator.#Dealphabetize(number.toString(), "lower");
                    break;
                case "ro":
                    number = TokenMoldNameGenerator.#Deromanize(number);
                    break;
            }

            // If result is no number, set to zero
            if (isNaN(number)) { 
                number = 0; 
            } else {
                // count upwards
                if (nameConfig.number.range > 1) {
                    number += Math.ceil(Math.random() * nameConfig.number.range);
                } else {
                    number++;
                }
            }

            switch (nameConfig.number.type) {
                case "alu":
                    number = TokenMoldNameGenerator.#Alphabetize(number, "upper");
                    break;
                case "all":
                    number = TokenMoldNameGenerator.#Alphabetize(number, "lower");
                    break;
                case "ro":
                    number = TokenMoldNameGenerator.#Romanize(number);
                    break;
            }

            CONFIG.COUNTERS[sceneID][actor.id] = number;

            numberSuffix = nameConfig.number.prefix + number + nameConfig.number.suffix;
            name += ` ${numberSuffix}`;
            name = name.trim();
        }

        return name;
    }

    static #GetAdjective(tableName) {
        const adj = CONFIG.ADJECTIVES[tableName].results._source[Math.floor(CONFIG.ADJECTIVES[tableName].results.size * Math.random())].text;
        return adj;
    }

    /**
     * Thanks for 'trdischat' for providing this awesome name generation algorithm!
     *  Base idea:
     * - Choose a language (depending on settings chosen)
     * - Choose a random starting trigram for the language, weighted by frequency used
     * - Go on choosing letters like before, using the previous found letter as starting letter of the trigram, until maximum is reached
     * @param {*} actor
     * @param {TokenMoldRuleConfig} ruleConfig
    */
    static #GenerateNewName(actor, ruleConfig) {
        const attributes = ruleConfig.name.options.attributes || [];

        let lang;
        for (let attribute of attributes) {
            const langs = attribute.languages;
            const val = TString(getProperty(actor.system, attribute.attribute)).toLowerCase();

            lang = langs[val];

            if (lang !== undefined) break;
        }

        if (lang === undefined) lang = ruleConfig.name.options.default;

        if (lang === "random") {
            const keys = Object.keys(CONFIG.DICTIONARY);
            lang = keys[Math.floor(Math.random() * keys.length)];
        }

        const minNameLen = ruleConfig.name.options.min || 6;
        const maxNameLen = ruleConfig.name.options.max || 9;

        const nameLength = Math.floor(Math.random() * (maxNameLen - minNameLen + 1)) + minNameLen;
        let newName = TokenMoldNameGenerator.#ChooseWeighted(CONFIG.DICTIONARY[lang].beg);
        const ltrs = (x, y, b) => x in b && y in b[x] && Object.keys(b[x][y]).length > 0 ? b[x][y] : false;

        for (let i = 4; i <= nameLength; i++) {
            const c1 = newName.slice(-2, -1);
            const c2 = newName.slice(-1);
            const br = i == nameLength ? CONFIG.DICTIONARY[lang].end : CONFIG.DICTIONARY[lang].mid;
            const c3 = ltrs(c1, c2, br) || ltrs(c1, c2, CONFIG.DICTIONARY[lang].all) || {};
            if (c1 == c2 && c1 in c3) delete c3[c1];
            if (Object.keys(c3).length == 0) break;
            newName = newName + TokenMoldNameGenerator.#ChooseWeighted(c3);
        }

        newName = newName[0] + TokenMoldNameGenerator.#ChangeCase(newName.slice(1), CONFIG.DICTIONARY[lang].upper, CONFIG.DICTIONARY[lang].lower);
        return newName;
    }

    static #ChooseWeighted(items) {
        var keys = Object.keys(items);
        var vals = Object.values(items);
        var sum = vals.reduce((accum, elem) => accum + elem, 0);
        var accum = 0;
        vals = vals.map((elem) => (accum = elem + accum));
        var rand = Math.random() * sum;
        return keys[vals.filter((elem) => elem <= rand).length];
    }

    static #ChangeCase(txt, fromCase, toCase) {
        var res = "";
        var c = "";
        for (c of txt) {
            let loc = fromCase.indexOf(c);
            if (loc < 0) {
                res = res + c;
            } else {
                res = res + toCase[loc];
            }
        }
        return res;
    }

    static #Dealphabetize(num, letterStyle) {
        if (num === "0") return 0;
        let ret = 0;
        const startValue = {
            upper: 64,
            lower: 96,
        }[letterStyle];

        for (const char of num) ret += char.charCodeAt(0) - startValue;

        return ret;
    }

    static #Alphabetize(num, letterStyle) {
        let ret = "";

        const startValue = {
            upper: 64,
            lower: 96,
        }[letterStyle];

        while (num >= 26) {
            ret += String.fromCharCode(startValue + 26);
            num -= 26;
        }

        ret += String.fromCharCode(startValue + num);

        return ret;
    }

    // Romanizes a number, code is from : http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    static #Romanize(num) {
        if (!+num) return false;
        var digits = String(+num).split(""),
            key = [
                "",
                "C",
                "CC",
                "CCC",
                "CD",
                "D",
                "DC",
                "DCC",
                "DCCC",
                "CM",
                "",
                "X",
                "XX",
                "XXX",
                "XL",
                "L",
                "LX",
                "LXX",
                "LXXX",
                "XC",
                "",
                "I",
                "II",
                "III",
                "IV",
                "V",
                "VI",
                "VII",
                "VIII",
                "IX",
            ],
            roman = "",
            i = 3;
        while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }

    // code is from : http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    static #Deromanize(rom) {
        if (typeof rom !== "string") return 0;
        let str = rom.toUpperCase(),
            validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/,
            token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g,
            key = {
                M: 1000,
                CM: 900,
                D: 500,
                CD: 400,
                C: 100,
                XC: 90,
                L: 50,
                XL: 40,
                X: 10,
                IX: 9,
                V: 5,
                IV: 4,
                I: 1,
            },
            num = 0,
            m;
        if (!(str && validator.test(str))) return false;
        while ((m = token.exec(str))) num += key[m[0]];
        return num;
    }

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