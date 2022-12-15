import { CONFIG } from "./config.mjs";
import { API } from "./utils/api.mjs";
import { TokenMoldConfigurationDialog } from "./forms/token-mold-configuration-dialog.mjs";
import { Logger } from "./logger/logger.mjs";
import { NameGenerator } from "./utils/namegenerator.mjs";
import { TokenMoldConfig } from "./utils/token-mold-config.mjs";

export class TokenMold {
    #section = null;
    #configForm = null;

    static DefaultSettings() {
        Logger.info(true, "Loading default Settings");

        return {
            GLOBAL: {
                Name: true,
                HP: true,
                Config: false,
                Overlay: true
            },
            CONFIGURATIONS: {
                "Unlinked": new TokenMoldConfig({active: true, isLocked: true}),
                "Linked": new TokenMoldConfig({key: "Linked", isLocked: true}),
                "Friendly": new TokenMoldConfig({key: "Friendly", isLocked: true}),
                "Neutral": new TokenMoldConfig({key: "Neutral", isLocked: true}),
                "Hostile": new TokenMoldConfig({key: "Hostile", isLocked: true})
            }
        };
    }

    static async LoadDicts() {
        // Remove if replace is unset
        const replaceActive = false;
        for (let key of Object.keys(CONFIG.SETTINGS.CONFIGURATIONS)) {
            if (CONFIG.SETTINGS.CONFIGURATIONS[key].name.replace === "replace") {
                replaceActive = true;
                break;
            }
        }

        if (!game.user || !game.user.isGM || replaceActive) {
            // Useful to free up memory? its "just" up to 17MB...
            return;
        }

        if (!CONFIG.DICTIONARY) { CONFIG.DICTIONARY = {}; }
        let languages = CONFIG.LANGUAGES;
        for (let lang of languages) {
            if (CONFIG.DICTIONARY[lang]) { continue; }
            CONFIG.DICTIONARY[lang] = (await import(`./dict/${lang}.js`)).lang;
        }
    }

    static async LoadTable() {
        for (let key of Object.keys(CONFIG.SETTINGS.CONFIGURATIONS)) {
            let document;
        
            try {
                document = await fromUuid(CONFIG.SETTINGS.CONFIGURATIONS[key].name.prefix.table);
            } catch (error) {
                // Reset if table not found..
                document = await fromUuid(TokenMold.DefaultSettings().CONFIGURATIONS[key].name.prefix.table);
                CONFIG.SETTINGS[key].name.prefix.table = TokenMold.DefaultSettings().name.prefix.table;
            }

            //TODO: Review CONFIG.ADJECTIVES - this may need to go away due to restructuring
            CONFIG.ADJECTIVES = document;
        }
    }

    static async SaveSettings() {
        if (!CONFIG.ADJECTIVES) { //} || CONFIG.ADJECTIVES.uuid !== CONFIG.SETTINGS.name.prefix.table) {
            TokenMold.LoadTable();
        }

        //TODO: This warning needs to be in the CONFIG section, not here.
        /*
        if (CONFIG.SETTINGS.name.replace === "remove" && (!CONFIG.SETTINGS.name.number.use && !CONFIG.SETTINGS.name.prefix.use)) {
            CONFIG.SETTINGS.name.replace = "nothing";
            Logger.warn(true, game.i18n.localize("TOKEN-MOLD.warn.removeName"));
            ui.notifications.warn(game.i18n.localize("TOKEN-MOLD.warn.removeName"))
        }
        */

        await game.settings.set("Token-Mold", "everyone", CONFIG.SETTINGS);
        TokenMold.LoadDicts();
        Logger.debug(false, "Saving Settings", CONFIG.SETTINGS);
    }

    constructor() {}

    initialize() {
        Logger.info(true, `/*** Initializing Token Mold ***\\`);
        game["token-mold"] = new API();
        CONFIG.GAME_SYSTEM = game.system?.id ?? game.data.system.id;
        CONFIG.SYSTEM_SUPPORTED = /dnd5e|pf2e|sfrpg|sw5e|dcc/.exec(CONFIG.GAME_SYSTEM) !== null;
        CONFIG.HP_SUPPORTED = ["dnd5e", "dcc", "sw5e"].includes(CONFIG.GAME_SYSTEM); // CAN BE CHANGED WITH PROPER CONFIGURATION

        this.#registerSettings();
        this.#loadSettings();
    }

    async onReady() {
        // Hooks.on("renderHeadsUpDisplay", async (app, html, data) => {
        //     html.append('<template id="token-mold-overlay"></template>');
        //     canvas.hud.TokenMold = new TokenMoldOverlay();
        // });

        if (!game.user.isGM) return;

        //   Hooks.on("deleteToken", (...args) => {
        //     if (!canvas.hud.TokenMold) return;
        //     canvas.hud.TokenMold.clear();
        //   });

        //   this._hookPreTokenCreate();
        //   this.barAttributes = await this._getBarAttributes();
        TokenMold.LoadDicts();

        await this.#getRollTables();
        await TokenMold.LoadTable();
    }

    hookActorDirectory(html) {
        this.#section = document.createElement("section");
        this.#section.classList.add("token-mold");

        // Add menu before directory header
        const dirHeader = html[0].querySelector(".directory-header");
        dirHeader.parentNode.insertBefore(this.#section, dirHeader);

        if (CONFIG.SETTINGS !== undefined) this.#renderActorDirectoryMenu();
    }

    async #getRollTables() {
        const rollTablePacks = game.packs.filter((e) => e.documentName === "RollTable");

        CONFIG.ROLLTABLES = {};
        if (game.tables.size > 0) CONFIG.ROLLTABLES["World"] = [];
        for (const table of game.tables) {
            CONFIG.ROLLTABLES["World"].push({name: table.name, uuid: `RollTable.${table.id}`});
        }

        for (const pack of rollTablePacks) {
            const idx = await pack.getIndex();
            CONFIG.ROLLTABLES[pack.metadata.label] = [];
            const tableString = `Compendium.${pack.collection}.`;
            for (let table of idx) {
                CONFIG.ROLLTABLES[pack.metadata.label].push({name: table.name, uuid: tableString + table._id });
            }
        }

        Logger.debug(false, "Rollable Tables found", CONFIG.ROLLTABLES);
    }

    #loadSettings() {
        CONFIG.SETTINGS = game.settings.get("Token-Mold", "everyone");
        // Check for old data
        if (CONFIG.SETTINGS.config.data !== undefined) {
            for (let [key, value] of Object.entries(CONFIG.SETTINGS.config.data)) {
                CONFIG.SETTINGS.config[key] = {
                    use: true,
                    value: value,
                };
            }
            delete CONFIG.SETTINGS.config.data;
            TokenMold.SaveSettings();
        }

        if (getProperty(CONFIG.SETTINGS, "overlay.attrs") && CONFIG.SETTINGS.overlay.attrs.length === 0) {
            delete CONFIG.SETTINGS.overlay.attrs;
        }

        if (getProperty(CONFIG.SETTINGS, "name.options.attributes") && CONFIG.SETTINGS.name.options.attributes.length === 0) {
            delete CONFIG.SETTINGS.name.options.attributes;
        }

        //Migrate to new configuration
        if (!CONFIG.SETTINGS.CONFIGURATIONS) {
            const settings = TokenMold.DefaultSettings();

            let unlinked = settings.CONFIGURATIONS["Unlinked"];
            unlinked.name = CONFIG.SETTINGS.name;
            unlinked.hp = CONFIG.SETTINGS.hp;
            unlinked.size = CONFIG.SETTINGS.size;
            unlinked.config = CONFIG.SETTINGS.config;
            unlinked.overlay = CONFIG.SETTINGS.overlay;

            if (!CONFIG.SETTINGS.unlinkedOnly) {
                //Utilize both linked and unlinked
                settings.CONFIGURATIONS["Linked"].active = true;
                settings.CONFIGURATIONS["Linked"].cloneFromSettings(unlinked);
            }

            CONFIG.SETTINGS = settings;
        }

        CONFIG.SETTINGS = mergeObject(TokenMold.DefaultSettings(), CONFIG.SETTINGS);

        /*
        if (/dnd5e|sw5e/.exec(TokenMold.GAME_SYSTEM) !== null) {
            if (CONFIG.SETTINGS.name.options === undefined) {
                const dndOptions = NameGenerator.dndDefaultNameOptions();
                CONFIG.SETTINGS.name.options.default = dndOptions.default;
                CONFIG.SETTINGS.name.options.attributes = dndOptions.attributes;
            }
        }
        */
        TokenMold.LoadDicts();
        Logger.debug(false, "Loading Settings", CONFIG.SETTINGS);
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
            name: game.i18n.localize("TOKEN-MOLD.SETTINGS.Config"),
            label: game.i18n.localize("TOKEN-MOLD.SETTINGS.ConfigLabel"),
            hint: game.i18n.localize("TOKEN-MOLD.SETTINGS.ConfigHint"),
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
            <h3>${game.i18n.localize("TOKEN-MOLD.ABOUT.Title")}</h3>
            <label class='label-inp' title='${game.i18n.localize("TOKEN-MOLD.SIDEBAR.Name")}'>
                <input class='name rollable' type='checkbox' name='name.use' ${CONFIG.SETTINGS.GLOBAL.Name ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("TOKEN-MOLD.LABELS.Name")}</span>
            </label>
            ${CONFIG.HP_SUPPORTED ? `
            <label class='label-inp' title='${game.i18n.localize("TOKEN-MOLD.SIDEBAR.HP")}'>
                <input class='hp rollable' type='checkbox' name='hp.use' ${CONFIG.SETTINGS.GLOBAL.HP ? "checked" : ""
                } ><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("TOKEN-MOLD.LABELS.HP")}</span>
            </label>`
                : ``
            }
            <label class='label-inp' title='${game.i18n.localize("TOKEN-MOLD.SIDEBAR.Token")}'>
                <input class='config rollable' type='checkbox' name='config.use' ${CONFIG.SETTINGS.GLOBAL.Config ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("TOKEN-MOLD.LABELS.Config")}</span>
            </label>
            <label class='label-inp' title='${game.i18n.localize("TOKEN-MOLD.SIDEBAR.Overlay")}'>
                <input class='config rollable' type='checkbox' name='overlay.use' ${CONFIG.SETTINGS.GLOBAL.Overlay ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;${game.i18n.localize("TOKEN-MOLD.LABELS.Overlay")}</span>
            </label>
    
    
            <a class='refresh-selected' title="${game.i18n.localize("TOKEN-MOLD.SIDEBAR.Reapply")}"><i class="fas fa-sync-alt"></i></a>
            <a class='token-rand-form-btn' title='${game.i18n.localize("TOKEN-MOLD.LABELS.Settings")}'><i class="fa fa-cog"></i></a>
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