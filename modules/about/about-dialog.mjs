export class AboutDialog extends FormApplication {
    static MODULE_ID = "";
    static TITLE = "";

    #version = 0;

    constructor(object, options) {
        super(object, options);

        this.#version = game.modules.get(AboutDialog.MODULE_ID).version ?? game.modules.get(AboutDialog.MODULE_ID).data.version;
    }

    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            id: `${AboutDialog.MODULE_ID}AboutDialog`,
            closeOnSubmit: false,
            height: "auto",
            width: 550,
            submitOnChange: true,
            template: `modules/${AboutDialog.MODULE_ID}/module/about/about-dialog.hbs`,
            title: AboutDialog.TITLE,
        };

        return foundry.utils.mergeObject(defaults, overrides);
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    getData(options) {
        let moduleID = AboutDialog.MODULE_ID.toUpperCase();
        let module_title = game.modules.get(AboutDialog.MODULE_ID).title ?? game.modules.get(AboutDialog.MODULE_ID).data.title;
        return {
            "created_by": game.i18n.localize(`${moduleID}.ABOUT.CreatedBy`),
            "supportCreator": game.i18n.localize(`${moduleID}.ABOUT.SupportTheCreator`),
            "live_support": game.i18n.localize(`${moduleID}.ABOUT.LiveSupport`),
            module_title,
            "project_page": game.i18n.localize(`${moduleID}.ABOUT.ProjectPage`),
            "url": game.modules.get(AboutDialog.MODULE_ID).url,
            "version": this.#version,
            "wiki": game.i18n.localize(`${AboutDialog.MODULE_ID}.ABOUT.Wiki`)
        };
    }
}