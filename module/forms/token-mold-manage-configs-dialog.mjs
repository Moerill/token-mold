import { HelpFormApplication } from "../about/help-form-application.mjs";
import { CONFIG } from "../config.mjs";
import { Logger } from "../logger/logger.mjs";
import { TokenMoldRuleConfig } from "../models/token-mold-rule-config.mjs";
import { TokenMold } from "../token-mold.mjs";
import { TokenMoldConfigurationDialog } from "./token-mold-configuration-dialog.mjs";

export class TokenMoldManageConfigsDialog extends HelpFormApplication {
    constructor(object, options) {
		if (!object) { object = {} }
		object.enableAboutButton = true;

		super(object, options);
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "modules/token-mold/templates/configs.hbs";
		options.width = 420;
		// options.height = 460;
		options.resizable = false;
		options.classes = ["token-mold", "token-mold-manage-dialog"];
		options.title = "Token Mold";
		options.closeOnSubmit = false;
		options.submitOnClose = true;
		options.submitOnChange = true;
		options.scrollY = ["section.content"];

		return options;
	}

    activateListeners(html) {
		super.activateListeners(html);

		html.on('click', '[data-action]', this.#handleAction.bind(this));
    }

    getData() {
        let data = {
            configs: CONFIG.SETTINGS.CONFIGURATIONS
        }

        Logger.debug(false, "Manage Configs Data", data);

        return data;
    }

	async _updateObject(event, formData) {
		Logger.debug(false, event, formData);
        let configID = $(event.currentTarget).parents("[data-id]")?.data()?.id;
        CONFIG.SETTINGS.CONFIGURATIONS.find(c => c.id === configID)[event.currentTarget.name] = formData[event.currentTarget.name];
        await TokenMold.SaveSettings();
    }

    async #handleAction(event) {
		const clickedElement = $(event.currentTarget);
		const action = clickedElement.data().action;
		let configID = clickedElement.parents("[data-id]")?.data()?.id;
        let dialog = null;
        let config = CONFIG.SETTINGS.CONFIGURATIONS.find(c => c.id === configID);
        
        switch (action) {
            case "clone":
                let newConfig = new TokenMoldRuleConfig(config);
                newConfig.configName += ` (${game.i18n.localize("TOKEN-MOLD.TOOLTIPS.Clone")})`;
                CONFIG.SETTINGS.CONFIGURATIONS.add(newConfig);

                await TokenMold.SaveSettings();
                await this.render(true);
                break;
            case "delete":
                break;
            case "edit":
                dialog = new TokenMoldConfigurationDialog({ruleConfig: config});
                break;
            default:
                break;
        }

        if (dialog) { dialog.render(true); }
    }
}