import { CONFIG } from "./config.mjs";
import { API } from "./utils/api.mjs";
import { TokenMoldConfigurationDialog } from "./forms/token-mold-configuration-dialog.mjs";
import { Logger } from "./logger/logger.mjs";

export class TokenMold {
    #section = null;
    #configForm = null;

    static DefaultSettings() {
        Logger.info(true, "Loading default Settings");
        CONFIG.SETTINGS = {
            unlinkedOnly: true,
            name: {
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
            },
            hp: {
                use: true,
                toChat: true,
            },
            size: {
                use: true,
            },
            config: {
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
            },
            overlay: {
                use: true,
                attrs: TokenMoldConfigurationDialog.defaultAttrs,
            },
        };

        return CONFIG.SETTINGS;
    }

    static async LoadDicts() {
        // Remove if replace is unset
        if (!game.user || !game.user.isGM || CONFIG.SETTINGS.name.replace !== "replace") {
            // Useful to free up memory? its "just" up to 17MB...
            return;
        }

        if (!CONFIG.DICTIONARY) { CONFIG.DICTIONARY = {}; }
        const options = CONFIG.SETTINGS.name.options;
        let languages = CONFIG.LANGUAGES;
        for (let lang of languages) {
            if (CONFIG.DICTIONARY[lang]) { continue; }
            CONFIG.DICTIONARY[lang] = (await import(`./dict/${lang}.js`)).lang;
        }
    }

    static async LoadTable() {
        let document;
        try {
            document = await fromUuid(CONFIG.SETTINGS.name.prefix.table);
        } catch (error) {
            // Reset if table not found..
            document = await fromUuid(TokenMold.DefaultSettings().name.prefix.table);
            CONFIG.SETTINGS.name.prefix.table = TokenMold.DefaultSettings().name.prefix.table;
        }

        CONFIG.ADJECTIVES = document;
    }

    static async SaveSettings() {
        if (!CONFIG.ADJECTIVES || CONFIG.ADJECTIVES.uuid !== CONFIG.SETTINGS.name.prefix.table) {
            TokenMold.LoadTable();
        }

        if (CONFIG.SETTINGS.name.replace === "remove" && (!CONFIG.SETTINGS.name.number.use && !CONFIG.SETTINGS.name.prefix.use)) {
            CONFIG.SETTINGS.name.replace = "nothing";
            Logger.warn(true, game.i18n.localize("tmold.warn.removeName"));
            ui.notifications.warn(game.i18n.localize("tmold.warn.removeName"))
        }

        await game.settings.set("Token-Mold", "everyone", CONFIG.SETTINGS);
        TokenMold.LoadDicts();
        Logger.debug(false, "Saving Settings", CONFIG.SETTINGS);
    }

    constructor() {

    }

    initialize() {
        Logger.info(true, `/*** Initializing Token Mold ***\\`);
        game["token-mold"] = new API();
        CONFIG.GAME_SYSTEM = game.system?.id ?? game.data.system.id;
        CONFIG.SYSTEM_SUPPORTED = /dnd5e|pf2e|sfrpg|sw5e|dcc/.exec(CONFIG.GAME_SYSTEM) !== null;
        CONFIG.HP_SUPPORTED = ["dnd5e", "dcc", "sw5e"].includes(CONFIG.GAME_SYSTEM); // CAN BE CHANGED WITH PROPER CONFIGURATION

        this.#registerSettings();
        this.#loadSettings();
    }

    hookActorDirectory(html) {
        this.#section = document.createElement("section");
        this.#section.classList.add("token-mold");

        // Add menu before directory header
        const dirHeader = html[0].querySelector(".directory-header");
        dirHeader.parentNode.insertBefore(this.#section, dirHeader);

        if (CONFIG.SETTINGS !== undefined) this.#renderActorDirectoryMenu();
    }

    #loadSettings() {

    }

    #registerSettings() {
        game.settings.register("Token-Mold", "everyone", {
            name: "Token Mold Settings",
            hint: "Settings definitions for the Token Mold Module",
            default: TokenMold.DefaultSettings(),
            type: Object,
            scope: "world",
            onChange: (data) => {
                this.data = data;
                this.#updateCheckboxes();
            },
        });

        game.settings.registerMenu("token-mold", "ModuleConfiguration", {
            name: game.i18n.localize("tmold.SETTINGS.Config"),
            label: game.i18n.localize("tmold.SETTINGS.ConfigLabel"),
            hint: game.i18n.localize("tmold.SETTINGS.ConfigHint"),
            restricted: true,
            icon: 'fas fa-cogs',
            type: TokenMoldConfigurationDialog
        });
    }

    #renderActorDirectoryMenu() {
        const section = this.#section;
        section.insertAdjacentHTML(
            "afterbegin",
            `
            <h3>${game.i18n.localize("tmold.ABOUT.Title")}</h3>
            <label class='label-inp' title='${game.i18n.localize("tmold.SIDEBAR.Name")}'>
                <input class='name rollable' type='checkbox' name='name.use' ${CONFIG.SETTINGS.name.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("tmold.LABELS.Name")}</span>
            </label>
            ${CONFIG.HP_SUPPORTED ? `
            <label class='label-inp' title='${game.i18n.localize("tmold.SIDEBAR.HP")}'>
                <input class='hp rollable' type='checkbox' name='hp.use' ${CONFIG.SETTINGS.hp.use ? "checked" : ""
                } ><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("tmold.LABELS.HP")}</span>
            </label>`
                : ``
            }
            <label class='label-inp' title='${game.i18n.localize("tmold.SIDEBAR.Token")}'>
                <input class='config rollable' type='checkbox' name='config.use' ${CONFIG.SETTINGS.config.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("tmold.LABELS.Config")}</span>
            </label>
            <label class='label-inp' title='${game.i18n.localize("tmold.SIDEBAR.Overlay")}'>
                <input class='config rollable' type='checkbox' name='overlay.use' ${CONFIG.SETTINGS.overlay.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("tmold.LABELS.Overlay")}</span>
            </label>
    
    
            <a class='refresh-selected' title="${game.i18n.localize("tmold.SIDEBAR.Reapply")}"><i class="fas fa-sync-alt"></i></a>
            <a class='token-rand-form-btn' title='${game.i18n.localize("tmold.LABELS.Settings")}'><i class="fa fa-cog"></i></a>
            <h2></h2>
            `
        );

        const inputs = section.querySelectorAll('input[type="checkbox"]');
        for (let checkbox of inputs) {
            checkbox.addEventListener("change", (ev) => {
                setProperty(CONFIG.SETTINGS, ev.target.name, ev.target.checked);
                TokenMold.SaveSettings();
            });
        }

        this.#section
            .querySelector(".refresh-selected")
            .addEventListener("click", (ev) => this.#refreshSelected());
        this.#section
            .querySelector(".token-rand-form-btn")
            .addEventListener("click", (ev) => {
                if (!this.#configForm) { this.#configForm = new TokenMoldConfigurationDialog(this); }
                this.#configForm.render(true);
            });
    }

    #refreshSelected() {

    }

    #updateCheckboxes() {

    }
}