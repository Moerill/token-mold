import { HelpFormApplication } from "../about/help-form-application.mjs";

export class TokenMoldRulesDialog extends HelpFormApplication {
    constructor(object, options) {
		if (!object) { object = {} }
		object.enableAboutButton = true;

		super(object, options);
	}

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "modules/token-mold/templates/rules.hbs";
		options.width = 420;
		// options.height = 460;
		options.resizable = false;
		options.classes = ["token-mold"];
		options.title = "Token Mold";
		options.closeOnSubmit = false;
		options.submitOnClose = true;
		options.submitOnChange = true;
		options.scrollY = ["section.content"];

		return options;
	}
}