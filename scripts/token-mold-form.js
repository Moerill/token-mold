import  TokenConsts  from "./token-consts.js"
import  TokenLog  from "./token-log.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class TokenMoldForm extends HandlebarsApplicationMixin(ApplicationV2) {

    // TODO Add a hook for getHeaderControlsTokenMoldForm ???
    // TODO Add a hook for renderTokenMoldForm ???

    /**
     * Applications are constructed by providing an object of configuration options.
     * @param {any}    object
     * @param {Partial<Configuration>} [options]    Options used to configure the Application instance
     */
    constructor(object, options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: constructor");
      super(options);
      this.object = object; // FIXME temporary while I figure out V2
      this.settings = object.settings;
      this.barAttributes = object.barAttributes || [];
    }

    /**
     * The default configuration options which are assigned to every instance of this Application class.
     * @type {Partial<Configuration>}
     */
    static DEFAULT_OPTIONS = {
      id: "token-mold-form",
      classes: ["token-mold"],
      tag: "form",
      window: {
        title: "Token Mold",
        icon: "fa-solid fa-gears",
        resizable: true,
        contentClasses: ["standard-form"]
      },
      form: {
        handler: TokenMoldForm.#onSubmit,
        submitOnChange: false,
        closeOnSubmit: true
      },
      position: {
        width: 565,
        height: 565
      }
    };

    /**
     * Configure a registry of template parts which are supported for this application for partial rendering.
     * @type {Record<string, HandlebarsTemplatePart>}
     */
    static PARTS = {
      tabs: {template: "templates/generic/tab-navigation.hbs"},
      infoHelp: {template: "modules/token-mold/templates/token-mold-form-info.hbs"},
      name: {template: "modules/token-mold/templates/token-mold-form-names.hbs"},
      systemSpecific: {template: "modules/token-mold/templates/token-mold-form-systemSpecific.hbs"},
      defaultConfig: {template: "modules/token-mold/templates/token-mold-form-config.hbs"},
      statOverlay: {template: "modules/token-mold/templates/token-mold-form-overlay.hbs"},
      footer: {template: "templates/generic/form-footer.hbs"}
    };
    // header: {template: "modules/token-mold/templates/token-mold-form-header.hbs"},

    /**
     * Configuration of application tabs, with an entry per tab group.
     * @type {Record<string, ApplicationTabsConfiguration>}
     */
    static TABS = {
      sections: {
        tabs: [
          {id: "infoHelp"},
          {id: "name"},
          {id: "systemSpecific"},
          {id: "defaultConfig"},
          {id: "statOverlay"}
        ],
        initial: "infoHelp",
        labelPrefix: "tmold.tab"
      }
    };

    /**
     * Array of icons for overlay
     * @private
     */
    static #DEFAULT_ICONS = Object.freeze([
      "&#xf06e;", // <i class="fa-solid fa-eye"></i>
      "&#xf3ed;", // <i class="fa-solid fa-shield-halved"></i>
      "&#xf6cf;", // <i class="fa-solid fa-dice-d20"></i>
      "&#xf21e;", // <i class="fa-solid fa-heart-pulse"></i>
      "&#xf6e8;", // <i class="fa-solid fa-hat-wizard"></i>
      "&#xf54b;", // <i class="fa-solid fa-shoe-prints"></i>
      "&#xf554;", // <i class="fa-solid fa-person-walking"></i>
      "&#xf70c;", // <i class="fa-solid fa-person-running"></i>
      "&#xf51e;", // <i class="fa-solid fa-coins"></i>
      "&#xf619;", // <i class="fa-solid fa-poop"></i>
      "&#xf290;", // <i class="fa-solid fa-bag-shopping"></i>
      "&#xf53a;", // <i class="fa-solid fa-money-bill-wave"></i>
      "&#xf0f2;", // <i class="fa-solid fa-suitcase"></i>
      "&#xf06d;", // <i class="fa-solid fa-fire"></i>
      "&#xf1b0;", // <i class="fa-solid fa-paw"></i>
      "&#xf787;", // <i class="fa-solid fa-carrot"></i>
      "&#xf5d7;", // <i class="fa-solid fa-bone"></i>
      "&#xf6d7;", // <i class="fa-solid fa-drumstick-bite"></i>
      "&#xf5d1;", // <i class="fa-solid fa-apple-whole"></i>
      "&#xf6de;", // <i class="fa-solid fa-hand-fist"></i>
      "&#xf669;", // <i class="fa-solid fa-jedi"></i>
      "&#xf753;", // <i class="fa-solid fa-meteor"></i>
      "&#xf186;", // <i class="fa-solid fa-moon"></i>
      "&#xf135;", // <i class="fa-solid fa-rocket"></i>
      "&#xf5dc;", // <i class="fa-solid fa-brain"></i>
      "&#xf1ae;", // <i class="fa-solid fa-child"></i>
    ]);

    /**
     * Style of number to append
     * @private
     */
    static #NUMBER_SYTLES = Object.freeze({
      ar: "arabic numerals",
      alu: "alphabetic UPPER",
      all: "alphabetic LOWER",
      ro: "roman numerals",
    });

    /**
     * Adjactive prefix positions
     * @private
     */
    static #PREFIX_POSITIONS = Object.freeze({
      front: "tmold.name.adjectivePlacementFront",
      back: "tmold.name.adjectivePlacementBack"
    });

    /**
     * Base name replacement options
     * @private
     */
    static #NAME_REPLACE_OPTIONS = Object.freeze({
      nothing: "tmold.name.baseNameNothing",
      remove: "tmold.name.baseNameRemove",
      replace: "tmold.name.baseNameReplace"
    });

    // /**
    //  * ApplicationV1 -- what's the V2 version?
    //  * @return {HeaderButton[]}
    //  */
    // _getHeaderButtons() {
    //   TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _getHeaderButtons");
    //   let btns = super._getHeaderButtons();
    //   btns[0].label = "Save & Close";
    //   return btns;
    // }

    /**
     * Process form submission for the sheet
     * @this {TokenMoldForm}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @param {object} [options]
     * @returns {Promise<*>}
     * @private
     */
    static async #onSubmit(event, form, formData, options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #onSubmit");

      // I have some questions about what this is doing.

      // TODO: replace jQuery
      const attrGroups = $(form).find(".attributes");
      let attrs = [];
      attrGroups.each((idx, e) => {
        // TODO: replace jQuery
        const el = $(e);
        const icon = el.find(".icon").val();
        const value = el.find(".value").val();
        //if (icon !== "" && value !== "") {
        if (icon && value) {
          attrs.push({
            icon: icon,
            path: value,
          });
        }
      });
      this.settings.overlay.attrs = attrs;

      this.settings.name.options.default = form
        .querySelector(".default-group")
        .querySelector(".language").value;
      const attributes = [];

      const langAttrGroups = form.querySelectorAll(".attribute-selection");

      langAttrGroups.forEach((el) => {
        let ret = { languages: {} };
        ret.attribute = el.querySelector(".attribute").value;
        el.querySelectorAll(".language-group").forEach((langGroup) => {
          ret.languages[langGroup.querySelector(".value").value.toLowerCase()] =
            langGroup.querySelector(".language").value;
        });
        attributes.push(ret);
      });

      this.settings.name.options.attributes = attributes;
      //super._onSubmit(options);

      let min = formData.object["name.options.min"],
        max = formData.object["name.options.max"];
      if (min < 0) {
        min = 0;
      }
      if (max < 0) {
        max = 0;
      }

      if (min > max) {
        const tmp = min;
        (min = max), (max = tmp);
      }

      formData.object["name.options.min"] = min;
      formData.object["name.options.max"] = max;

      // For name prefix and suffix, if the value is only a space the formData doesn't pick it up, so check and manually set prior to merge.
      // TODO: replace jQuery
      let prefix = $(this.form).find("input[name='name.number.prefix']").val();
      // TODO: replace jQuery
      let suffix = $(this.form).find("input[name='name.number.suffix']").val();
      formData.object["name.number.prefix"] =
        formData.object["name.number.prefix"] !== prefix
          ? prefix
          : formData.object["name.number.prefix"];
      formData.object["name.number.suffix"] =
        formData.object["name.number.suffix"] !== suffix
          ? suffix
          : formData.object["name.number.suffix"];

      this.object.settings = foundry.utils.mergeObject(this.settings, formData.object);

      if (this._resetOptions === true) {
        const dndOptions = this.object.dndDefaultNameOptions;
        this.object.settings.name.options.default = dndOptions.default;
        this.object.settings.name.options.attributes = dndOptions.attributes;
        this._resetOptions = false;

        this.render();
      }
      this.object.saveSettings();
    }


    // /**
    //  * Actions performed before closing the Application.
    //  * Pre-close steps are awaited by the close process.
    //  * @param {RenderOptions} options                 Provided render options
    //  * @returns {Promise<void>}
    //  * @protected
    //  * @override
    //  */
    // async _preClose(options) {
    //   TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _preClose");
    //   // Manual implementation of submitOnClose
    //   await this.submit();
    // }

    /**
     * Prepare application rendering context data for a given render request. If exactly one tab group is configured for
     * this application, it will be prepared automatically.
     * @param {RenderOptions} options                 Options which configure application rendering behavior
     * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
     * @protected
     * @override
     */
    async _prepareContext(options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _prepareContext");
      const context = await super._prepareContext(options);

      // used in multiple tabs
      context.actorAttributes = this.#actorAttributes;
      context.settings = this.settings;

      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: Prepared Context", context, );
      return context;
    }

    /**
     * Prepare context that is specific to only a single rendered part.
     *
     * It is recommended to augment or mutate the shared context so that downstream methods like _onRender have
     * visibility into the data that was used for rendering. It is acceptable to return a different context object
     * rather than mutating the shared context at the expense of this transparency.
     *
     * @param {string} partId                         The part being rendered
     * @param {ApplicationRenderContext} context      Shared context provided by _prepareContext
     * @param {HandlebarsRenderOptions} options       Options which configure application rendering behavior
     * @returns {Promise<ApplicationRenderContext>}   Context data for a specific part
     * @protected
     * @override
     */
    async _preparePartContext(partId, context, options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _preparePartContext", partId);
      const partContext = await super._preparePartContext(partId, context, options);
      if ( partId in partContext.tabs ) {
        partContext.tab = partContext.tabs[partId];
      }
      switch (partId) {
        case "infoHelp":
          break;
        case "name":
          // probably not the smartest way
          let langs = {};
          Object.assign(langs, {["random"]:game.i18n.localize("tmold.name.random")});
          partContext.languages = TokenConsts.LANGUAGES.reduce((languages, language) => Object.assign(languages, {[language]: language}), langs);
          partContext.numberStyles = TokenMoldForm.#NUMBER_SYTLES;
          partContext.prefixPositions = TokenMoldForm.#PREFIX_POSITIONS;
          partContext.nameReplaceOptions = TokenMoldForm.#NAME_REPLACE_OPTIONS;
          partContext.rollTableList = this.object._rollTableList;
          break;
        case "systemSpecific":
          partContext.showCreatureSize = TokenConsts.SUPPORTED_CREATURESIZE.includes(game.system.id);
          partContext.showHP = TokenConsts.SUPPORTED_ROLLHP.includes(game.system.id);
          break;
        case "defaultConfig":
          const PrototypeTokenConfig = foundry.applications.sheets.PrototypeTokenConfig;
          partContext.barAttributes = this.barAttributes;
          partContext.displayModes = PrototypeTokenConfig.DISPLAY_MODES;
          partContext.dispositions = PrototypeTokenConfig.TOKEN_DISPOSITIONS;
          break;
        case "statOverlay":
          partContext.defaultIcons = TokenMoldForm.#DEFAULT_ICONS.reduce((icons, icon) => Object.assign(icons, {[icon]: icon}), {});
          break;
        case "footer":
          partContext.buttons = this.#prepareButtons();
          break;
      }
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: Prepared Part Context", partContext, );
      return partContext;
    }

    /**
     * Configure the sheet's pair of footer buttons.
     * type, name, cssClass, action, disabled, icon, label (label is localized)
     * @returns {FormFooterButton[]}
     * @private
     */
    #prepareButtons() {
      return [
        {type: "submit", icon: "fa-solid fa-floppy-disk", label: "Save & Close"}
      ];
    }

    /**
     * Modify the provided options passed to a render request.
     * @param {RenderOptions} options                 Options which configure application rendering behavior
     * @protected
     * @override
     */
    _configureRenderOptions(options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _configureRenderOptions", options);
      super._configureRenderOptions(options);

      // Remove system specific tab when not supported
      if ( !TokenConsts.SUPPORTED_SYSTEMS.includes(game.system.id) ) {
        const index = options.parts.indexOf("systemSpecific");
        if (index > -1) { // only splice array when item is found
          options.parts.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
    }



    //
    // Should this be all converted to actions??
    // Requires adding data-action="" to anchors
    //

    /**
     * Actions performed after any render of the Application.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @returns {Promise<void>}
     * @protected
     * @override
     */
    async _onRender(context, options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _onRender");

      await super._onRender(context, options);

      // TODO fix: .parentNode.parentNode
      // TODO: replace jQuery
      const html = $(this.element);

      html.find(".add-attribute").on("click", (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.add-attribute");
        // TODO: replace jQuery
        const addBtn = $(ev.target);
        const clone = addBtn.prev().clone();
        clone.find("select").val("");
        addBtn.before(clone);
      });

      html.on("click", ".attribute-remove", (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.attribute-remove");
        // TODO: replace jQuery
        const container = $(ev.currentTarget).closest(".form-group");

        if (container.prev('.form-group:not(".header")').length > 0 || container.next(".form-group").length > 0) {
          container.remove();
        }
      });

      html.find(".overlay").on("change keyup", "input.icon", (ev) => {
        ev.target.parentNode.parentNode.getElementsByClassName("prev", )[0].innerHTML = "17&nbsp;" + ev.target.value;
      });

      // TODO fix: .parentNode.parentNode.parentNode
      html.find(".name-replace").on("change", (ev) => {
        const nameRandomizer = ev.currentTarget.parentNode.parentNode.parentNode.querySelector(".name-randomizer-options", );
        if (ev.currentTarget.value === "replace") {
          nameRandomizer.style.display = "block";
        } else {
          nameRandomizer.style.display = "none";
        }
      });
      html.find(".name-replace").change();

      html.on("click", ".add-language-value", (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.add-language-value");
        // TODO: replace jQuery
        const addBtn = $(ev.target);
        const clone = addBtn.prev().clone();
        clone.find("input").val("");
        clone.find("select").val("random");
        addBtn.before(clone);
      });

      html.on("click", ".add-language-attribute", (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.add-language-attribute");
        // TODO: replace jQuery
        const addBtn = $(ev.target);
        const clone = addBtn.prev().clone();
        clone.children(".attribute").val("");
        clone
          .children(".language-selection")
          .children(".language-group")
          .each((idx, el) => {
            if (idx > 0) el.remove();
          });
        const langSelection = clone.children(".language-selection");
        langSelection.find("input").val("");
        langSelection.find("select").val("random");
        addBtn.before(clone);
      });

      html.on("click", ".lang-remove", (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.lang-remove");
        // TODO: replace jQuery
        const container = $(ev.currentTarget).closest(".form-group");

        let prev = container.prev(".form-group");
        // only delete if not last element
        if (prev.length > 0 || container.next(".form-group").length > 0) {
          container.remove();
        } else {
          // alternatively delete whole attribute
          const parentContainer = container.closest(".attribute-group");
          if (parentContainer.prev('.attribute-group:not(".default")').length > 0 || parentContainer.next('.attribute-group:not(".default")').length > 0) {
            parentContainer.remove();
          }
        }
      });

      if (game.system.id === "dnd5e") {
        const resetBtn = html.find(".reset");
        resetBtn[0].innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        resetBtn.on("click", async (ev) => {
          TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.reset");
          this._resetOptions = true;
          await this.submit();
        });
      }

      this.element.querySelector(".reroll-names").addEventListener("click", (ev) => {
        const selected = canvas.tokens.controlled;
        let udata = [];
        for (const token of selected) {
          // Should this be checking for actorLink && unlinkedOnly?
          const newName = this.object.pickNewName(token.actor);
          udata.push({
            _id: token.id,
            name: newName
          });
        }

        canvas.scene.updateEmbeddedDocuments("Token", udata);
      });

      html.on("click", ".reset-counter", async (ev) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: click.reset-counter");
        const sceneId = canvas.scene.id;

        this.object.counter[sceneId] = {};
        const tokens = canvas.scene.getEmbeddedCollection("Token");

        for (const token of tokens) {
          if (token.actorId) {
            this.object.counter[sceneId][token.actorId] = 0;
          }
        }

        ui.notifications.notify("Finished resetting counters");
      });
    }

    /**
     *
     * @return {object[][]}
     * @private
     */
    get #actorAttributes() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #actorAttributes");
      let getAttributes = function (data, parent) {
        parent = parent || [];
        let valid = [];
        for (let [k, v] of Object.entries(data)) {
          let p = parent.concat([k]);
          if (v instanceof Object) {
            valid = valid.concat(getAttributes(data[k], p));
          } else {
            valid.push(p);
          }
        }
        return valid;
      };

      let attributeList = [];

      const types = Actor.implementation.TYPES.filter(x => x !== 'base');
      const shellMap = new Map( types.map((t) => [t, new Actor.implementation({ name: t, type: t })]), );
      shellMap.forEach((value, key, map) => {
        const newAttributes = getAttributes(value.toObject().system).map((e) => e.join("."), );
        // find dups
        for (let attr of newAttributes) {
          // Search if attribute already found
          let dup = attributeList.find((el) => el[1].includes(attr));
          // If not found,  add to attributes
          if (dup === undefined) {
            attributeList.push([key].concat(attr));
          } else {
            // if found add actor type to list
            dup[0] += ", " + key;
          }
        }
      });

      // Sort in groups by first element
      let newGroups = [];

      newGroups.push({group:"", value:"", label: game.i18n.localize("tmold.stat.attributeNone")});
      newGroups.push({group:"", value:"name", label: game.i18n.localize("tmold.stat.attributeName")});

      //let groups = {};
      for (var attr of attributeList) {
        const split = attr[1].split(".");
        const document = attr[0];
        const group = split[0];

        let attribute = split.splice(1).join(".");
        newGroups.push({group:group, value:`system.${group}.${attribute}`, label: `${attribute} [${document}]`});
      }

      // also populate with some calculated data for dnd5e, that is not in the template.json
      if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
        const npc = shellMap.get("npc");
        for (let skill of Object.keys(npc.toObject().system.skills)) {
          newGroups.push({group:"skills", value:`system.skills.${skill}.passive`, label: `${skill}.passive [character, npc]`});
        }
        newGroups.push({group:"attributes", value:"system.attributes.ac.value", label: "ac.value [character, npc]"});
      }

      let sortFn = function (a, b) {
        let compare = a.group.localeCompare(b.group);
        if (compare == 0) {
          return a.value.localeCompare(b.value);
        }
        return compare;
      };
      newGroups.sort(sortFn);

      return newGroups;
    }
  }
