import { CONFIG } from "./config.mjs";
import { API } from "./utils/api.mjs";
import { TokenMoldConfigurationDialog } from "./forms/token-mold-configuration-dialog.mjs";
import { Logger } from "./logger/logger.mjs";
import { TokenMoldNameGenerator } from "./utils/namegenerator.mjs";
import { TokenMoldRule } from "./models/token-mold-rule.mjs";
import { TokenMoldRuleConfig } from "./models/token-mold-rule-config.mjs";
import { TokenMoldRulesDialog } from "./forms/token-mold-rules-dialog.mjs";
import { TokenMoldManageConfigsDialog } from "./forms/token-mold-manage-configs-dialog.mjs";

export class TokenMold {
    #section = null;
    #configForm = null;
    #ruleForm = null;

    static DefaultSettings() {
        Logger.info(true, "Loading default Settings");

        const defaults = {
            GLOBAL: {
                Config: false,
                HP: true,
                Name: true,
                Overlay: true,
                PreloadTables: false,
            },
            RULES: new Set(),
            CONFIGURATIONS: new Set([new TokenMoldRuleConfig()])
        };

        defaults.RULES.add(new TokenMoldRule({name: "Unlinked Tokens", configID: defaults.CONFIGURATIONS.first().id}));

        return defaults;
    }

    static async LoadDicts() {
        // Remove if replace is unset
        let replaceActive = false;
        for (let c of CONFIG.SETTINGS.CONFIGURATIONS) {
            if (c.name.replace === "replace") {
                replaceActive = true;
                break;
            }
        }

        if (!game.user || !game.user.isGM || !replaceActive) {
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

    static async LoadTables() {
        CONFIG.ADJECTIVES = {};
        if (!CONFIG.SETTINGS.GLOBAL.PreloadTables) { return; }

        for (let config of CONFIG.SETTINGS.CONFIGURATIONS) {
            let document;
        
            if (config.name.prefix.addAdjective) {
                try {
                    document = await fromUuid(config.name.prefix.table);
                } catch (error) {
                    // Reset if table not found..
                    document = await fromUuid(TokenMold.DefaultSettings().CONFIGURATIONS.first().name.prefix.table);
                    config.name.prefix.table = TokenMold.DefaultSettings().CONFIGURATIONS.first().name.prefix.table;
                }

                CONFIG.ADJECTIVES[config.name.prefix.table] = document;
            }

            if (config.name.suffix.addAdjective) {
                try {
                    document = await fromUuid(config.name.suffix.table);
                } catch (error) {
                    // Reset if table not found..
                    document = await fromUuid(TokenMold.DefaultSettings().CONFIGURATIONS.first().name.suffix.table);
                    config.name.suffix.table = TokenMold.DefaultSettings().CONFIGURATIONS.first().name.suffix.table;
                }

                CONFIG.ADJECTIVES[config.name.suffix.table] = document;
            }

        }
    }

    static async SaveSettings() {
        TokenMold.LoadTables();

        //TODO: This warning needs to be in the CONFIG section, not here.
        /*
        if (CONFIG.SETTINGS.name.replace === "remove" && (!CONFIG.SETTINGS.name.number.use && !CONFIG.SETTINGS.name.prefix.use)) {
            CONFIG.SETTINGS.name.replace = "nothing";
            Logger.warn(true, game.i18n.localize("TOKEN-MOLD.warn.removeName"));
            ui.notifications.warn(game.i18n.localize("TOKEN-MOLD.warn.removeName"))
        }
        */

        Logger.debug(false, "Saving settings:", CONFIG.SETTINGS);
        //Sets can't be saved to flags, so convert them to objects for now
        if (CONFIG.SETTINGS.RULES instanceof Set) { CONFIG.SETTINGS.RULES = CONFIG.SETTINGS.RULES.toObject(); }
        if (CONFIG.SETTINGS.CONFIGURATIONS instanceof Set) { CONFIG.SETTINGS.CONFIGURATIONS = CONFIG.SETTINGS.CONFIGURATIONS.toObject(); }
        await game.settings.set("token-mold", "everyone", CONFIG.SETTINGS);
        //Convert them back
        if (!(CONFIG.SETTINGS.RULES instanceof Set)) { CONFIG.SETTINGS.RULES = new Set(Object.values(CONFIG.SETTINGS.RULES)); }
        if (!(CONFIG.SETTINGS.CONFIGURATIONS instanceof Set)) { CONFIG.SETTINGS.CONFIGURATIONS = new Set(Object.values(CONFIG.SETTINGS.CONFIGURATIONS)); }

        TokenMold.LoadDicts();
        Logger.debug(false, "Saved Settings", CONFIG.SETTINGS);
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

        return this.preloadHandlebarTemplates();
    }

    async onReady() {
        if (CONFIG.OLD_SETTINGS) {
            await TokenMold.SaveSettings();
            await game.settings.set("Token-Mold", "everyone", null);
            CONFIG.OLD_SETTINGS = null;
        }

        // Hooks.on("renderHeadsUpDisplay", async (app, html, data) => {
        //     html.append('<template id="token-mold-overlay"></template>');
        //     canvas.hud.TokenMold = new TokenMoldOverlay();
        // });

        if (!game.user.isGM) return;

        //   Hooks.on("deleteToken", (...args) => {
        //     if (!canvas.hud.TokenMold) return;
        //     canvas.hud.TokenMold.clear();
        //   });

        this.#registerPreTokenCreate();
        //   this.barAttributes = await this._getBarAttributes();
        TokenMold.LoadDicts();

        await this.#getRollTables();
        await TokenMold.LoadTables();
    }

    preloadHandlebarTemplates = async function() {
        //Partials
        return loadTemplates([
            "modules/token-mold/templates/partials/hp-tab.hbs",
            "modules/token-mold/templates/partials/name-tab.hbs"
        ]);
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
        let oldSettings = game.settings.get("Token-Mold", "everyone");
        if (oldSettings) {
            this.#migrateOldSettiongs(oldSettings);
            CONFIG.SETTINGS = mergeObject(CONFIG.OLD_SETTINGS, game.settings.get("token-mold", "everyone"));
        } else {
            CONFIG.SETTINGS = game.settings.get("token-mold", "everyone");
        }

        Logger.debug(false, "Loading Settings, start are: ", CONFIG.SETTINGS);

        CONFIG.SETTINGS = mergeObject(TokenMold.DefaultSettings(), CONFIG.SETTINGS);

        if (!(CONFIG.SETTINGS.RULES instanceof Set)) {
            CONFIG.SETTINGS.RULES = new Set(Object.values(CONFIG.SETTINGS.RULES));
        }

        if (!(CONFIG.SETTINGS.CONFIGURATIONS instanceof Set)) {
            CONFIG.SETTINGS.CONFIGURATIONS = new Set(Object.values(CONFIG.SETTINGS.CONFIGURATIONS));
        }

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
        Logger.debug(false, "Loaded Settings", CONFIG.SETTINGS);
    }

    #registerSettings() {
        game.settings.register("token-mold", "everyone", {
            name: "Token Mold Settings",
            hint: "Settings definitions for the Token Mold Module",
            default: TokenMold.DefaultSettings(),
            type: Object,
            scope: "world",
            onChange: (data) => {
                this.#loadSettings();
                this.#updateCheckboxes();
            },
        });

        game.settings.register("token-mold", "preloadTables", {
            name: game.i18n.localize("TOKEN-MOLD.SETTINGS.PreloadTablesLabel"),
            hint: game.i18n.localize("TOKEN-MOLD.SETTINGS.PreloadTablesHint"),
            scope: "world",
            restricted: true,
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                CONFIG.SETTINGS.GLOBAL.PreloadTables = value;
                TokenMold.LoadTables();
            }
        })

        game.settings.registerMenu("token-mold", "ModuleConfiguration", {
            name: game.i18n.localize("TOKEN-MOLD.SETTINGS.Config"),
            label: game.i18n.localize("TOKEN-MOLD.SETTINGS.ConfigLabel"),
            hint: game.i18n.localize("TOKEN-MOLD.SETTINGS.ConfigHint"),
            restricted: true,
            icon: 'fas fa-cogs',
            type: TokenMoldConfigurationDialog
        });

        //Deprecated - this was for old settings, and used the wrong ID to register.
        game.settings.register("Token-Mold", "everyone", {
            name: "Token Mold Settings",
            hint: "Deprecated settings definitions for the Token Mold Module",
            default: null,
            type: Object,
            scope: "world",
        });
    }

    async #migrateOldSettiongs(oldSettings) {
        Logger.debug(false, "Migrating Old Settings", oldSettings);

        if (oldSettings.config?.data !== undefined) {
            for (let [key, value] of Object.entries(CONFIG.SETTINGS.config.data)) {
                oldSettings.config[key] = {
                    use: true,
                    value: value,
                };
            }
            delete oldSettings.config.data;
        }

        if (getProperty(oldSettings, "overlay.attrs") && oldSettings.overlay.attrs.length === 0) {
            delete oldSettings.overlay.attrs;
        }

        if (getProperty(oldSettings, "name.options.attributes") && oldSettings.name.options.attributes.length === 0) {
            delete oldSettings.name.options.attributes;
        }

        //Migrate to new configuration
        if (!oldSettings.CONFIGURATIONS) {
            const settings = TokenMold.DefaultSettings();

            let defaultSettings = settings.CONFIGURATIONS.first();

            defaultSettings.name = mergeObject(defaultSettings.name, oldSettings.name);
            defaultSettings.name.number.prefix = defaultSettings.name.number.prefix.trim();
            defaultSettings.hp = mergeObject(defaultSettings.hp, oldSettings.hp);
            defaultSettings.size = mergeObject(defaultSettings.size, oldSettings.size);
            defaultSettings.properties = mergeObject(defaultSettings.properties, oldSettings.config);
            defaultSettings.overlay = mergeObject(defaultSettings.overlay, oldSettings.overlay);

            if (!oldSettings.unlinkedOnly) {
                //Utilize both linked and unlinked
                settings.RULES.add(new TokenMoldRule({name: "Linked Tokens", priority: 1, affectLinked: true, configID: settings.CONFIGURATIONS.first().id}));

                settings.RULES = new Set([...settings.RULES.values()].sort((a, b) => b.priority - a.priority));
            }

            oldSettings = mergeObject(oldSettings, settings);
        }

        if (oldSettings.name) {
            delete oldSettings.name;
        }

        Logger.debug(false, "Old Settings", oldSettings);

        CONFIG.OLD_SETTINGS = oldSettings;
    }

    #renderActorDirectoryMenu() {
        const section = this.#section;
        section.insertAdjacentHTML(
            "afterbegin",
            `
            <div class="token-mold-actor-directory-header">
                <h3>${game.i18n.localize("TOKEN-MOLD.ABOUT.Title")}</h3>
                <div class="token-mold-directory-icons">
                    <a class="token-mold-manage-rules-button" title='${game.i18n.localize("TOKEN-MOLD.TOOLTIPS.ManageRules")}'><i class="fas fa-list"></i></a>
                    <a class="token-mold-manage-configs-button" title='${game.i18n.localize("TOKEN-MOLD.TOOLTIPS.ManageConfigs")}'><i class="fas fa-cog"></i></a>
                </div>
            </div>
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
            <h2></h2>
            `
        );
//            <a class='token-rand-form-btn' title='${game.i18n.localize("TOKEN-MOLD.LABELS.Settings")}'><i class="fa fa-cog"></i></a>

        const inputs = section.querySelectorAll('input[type="checkbox"]');
        for (let checkbox of inputs) {
            checkbox.addEventListener("change", (ev) => {
                setProperty(CONFIG.SETTINGS, ev.target.name, ev.target.checked);
                TokenMold.SaveSettings();
            });
        }

        this.#section.querySelector(".refresh-selected").addEventListener("click", (ev) => this.#refreshSelected());
        this.#section.querySelector(".token-mold-manage-rules-button").addEventListener("click", (ev) => {
            if (!this.#ruleForm) { this.#ruleForm = new TokenMoldRulesDialog(this); }
            this.#ruleForm.render(true);
        });
        this.#section.querySelector(".token-mold-manage-configs-button").addEventListener("click", (ev) => {
            if (!this.#configForm) { this.#configForm = new TokenMoldManageConfigsDialog(); }
            this.#configForm.render(true);
        });
        // this.#section
        //     .querySelector(".token-rand-form-btn")
        //     .addEventListener("click", (ev) => {
        //         if (!this.#configForm) { this.#configForm = new TokenMoldConfigurationDialog(this); }
        //         this.#configForm.render(true);
        //     });
    }

    #refreshSelected() {

    }

    #updateCheckboxes() {

    }

    #determineRuleForToken(tokenData) {
        let foundRule = null;

        for (let value of CONFIG.SETTINGS.RULES) {
            foundRule = value;
            if (value.affectLinked != tokenData.actorLink) {
                foundRule = null;
            }

            if (foundRule) { break; }
        }

        return foundRule;
    }

    #registerPreTokenCreate() {
        Hooks.on("preCreateToken", (token, data, options, userId) => {
            const scene = token.parent;
            this.#setTokenData(scene, data);
            Logger.debug(false, "preCreateToken", token, data);
            token.updateSource(data);
        });
    }

    #setTokenData(scene, data) {
        const actor = game.actors.get(data.actorId);

        let rule = this.#determineRuleForToken(data);

        if (!rule) { return {}; } //No rule, return blank update data - fixes compatibility with other modules and certain systems!
        const config = CONFIG.SETTINGS.CONFIGURATIONS.find(c => c.id === rule.configID);
        Logger.debug(false, "Found Rule: ", rule, config);

        if (!config) { 
            Logger.error(true, `Unable to find config for rule!`, rule);
            return {}; 
        }
    
        if (CONFIG.COUNTERS[scene.id] === undefined) { CONFIG.COUNTERS[scene.id] = {}; }

        if (config.name.use) {
            const newName = TokenMoldNameGenerator.GenerateNameFromRuleConfig(actor, config, scene.id, event.getModifierState("Shift"));// this.#modifyName(data, actor, scene.id);
            data.name = newName;
            setProperty(data, "actorData.name", newName);
        }

        //Apply config to token data


        // Do this for all tokens, even player created ones
        // if (this.data.size.use && /dnd5e|pf2e/.exec(TokenMold.GAME_SYSTEM) !== null)
        //   this._setCreatureSize(data, actor, scene.id);
    
        // if (this.data.name.use) {
        //   const newName = this._modifyName(data, actor, scene.id);
        //   data.name = newName;
        //   setProperty(data, "actorData.name", newName);
        // }
    
        // if (/dnd5e|dcc/.exec(TokenMold.GAME_SYSTEM) !== null) {
        //   if (this.data.hp.use) this._rollHP(data, actor);
        // }
    
        // if (this.data.config.use) this._overwriteConfig(data, actor);
    
        return data;
    }
}