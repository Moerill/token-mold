import TokenConsts from "./token-consts.js";
import TokenLog from "./token-log.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class TokenMoldForm extends HandlebarsApplicationMixin(
  ApplicationV2
) {
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
      contentClasses: ["standard-form"],
    },
    form: {
      handler: TokenMoldForm.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: true,
    },
    position: {
      width: 565,
      height: 565,
    },
    actions: {
      addoverlayattribute: TokenMoldForm.#addOverlayAttribute,
      removeoverlayattribute: TokenMoldForm.#removeOverlayAttribute,
      addlanguageattribute: TokenMoldForm.#addLanguageAttribute,
      addlanguagevalue: TokenMoldForm.#addLanguageValue,
      removelanguagevalue: TokenMoldForm.#removeLanguageValue,
      rerollnames: TokenMoldForm.#rerollNames,
      resetcounter: TokenMoldForm.#resetCounter,
      resetlang: TokenMoldForm.#resetLanguages,
    },
  };

  /**
   * Configure a registry of template parts which are supported for this application for partial rendering.
   * @type {Record<string, HandlebarsTemplatePart>}
   */
  static PARTS = {
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    infoHelp: {
      template: "modules/token-mold/templates/token-mold-form-info.hbs",
    },
    name: {
      template: "modules/token-mold/templates/token-mold-form-names.hbs",
    },
    systemSpecific: {
      template:
        "modules/token-mold/templates/token-mold-form-systemSpecific.hbs",
    },
    defaultConfig: {
      template: "modules/token-mold/templates/token-mold-form-config.hbs",
    },
    statOverlay: {
      template: "modules/token-mold/templates/token-mold-form-overlay.hbs",
    },
    footer: { template: "templates/generic/form-footer.hbs" },
  };
  // header: {template: "modules/token-mold/templates/token-mold-form-header.hbs"},

  /**
   * Configuration of application tabs, with an entry per tab group.
   * @type {Record<string, ApplicationTabsConfiguration>}
   */
  static TABS = {
    sections: {
      tabs: [
        { id: "infoHelp" },
        { id: "name" },
        { id: "systemSpecific" },
        { id: "defaultConfig" },
        { id: "statOverlay" },
      ],
      initial: "infoHelp",
      labelPrefix: "tmold.tab",
    },
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
    back: "tmold.name.adjectivePlacementBack",
  });

  /**
   * Base name replacement options
   * @private
   */
  static #NAME_REPLACE_OPTIONS = Object.freeze({
    nothing: "tmold.name.baseNameNothing",
    remove: "tmold.name.baseNameRemove",
    replace: "tmold.name.baseNameReplace",
  });

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
  static async #onSubmit(event, form, formData) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #onSubmit");

    // I have some questions about what this is doing.

    const attrGroups = form.querySelectorAll(".overlay.attributes");
    let attrs = [];
    attrGroups.forEach((e) => {
      const icon = e.querySelector(".overlay-icon.fa-solid").value;
      const value = e.querySelector(".overlay-value").value;
      if (icon && value) {
        attrs.push({
          icon: icon,
          path: value,
        });
      }
    });
    this.settings.overlay.attrs = attrs;

    this.settings.name.options.default = form
      .querySelector(".language-default-group")
      .querySelector(".name-language").value;
    const attributes = [];

    const langAttrGroups = form.querySelectorAll(".language-attribute-group");

    langAttrGroups.forEach((el) => {
      let ret = { languages: {} };
      ret.attribute = el.querySelector(".language-attribute").value;
      el.querySelectorAll(".language-group").forEach((langGroup) => {
        ret.languages[
          langGroup.querySelector(".name-value").value.toLowerCase()
        ] = langGroup.querySelector(".name-language").value;
      });
      attributes.push(ret);
    });

    this.settings.name.options.attributes = attributes;

    // make sure min < max and both > 0
    let min = formData.object["name.options.min"];
    let max = formData.object["name.options.max"];
    if (min < 0) {
      min = 0;
    }
    if (max < 0) {
      max = 0;
    }

    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    formData.object["name.options.min"] = min;
    formData.object["name.options.max"] = max;

    // For name prefix and suffix, if the value is only a space the formData doesn't pick it up,
    //  so check and manually set prior to merge.
    let prefix = form.querySelector("input[name='name.number.prefix']").value;
    let suffix = form.querySelector("input[name='name.number.suffix']").value;
    formData.object["name.number.prefix"] =
      formData.object["name.number.prefix"] !== prefix
        ? prefix
        : formData.object["name.number.prefix"];
    formData.object["name.number.suffix"] =
      formData.object["name.number.suffix"] !== suffix
        ? suffix
        : formData.object["name.number.suffix"];

    // merges form elements with names
    this.object.settings = foundry.utils.mergeObject(
      this.settings,
      formData.object
    );

    if (this._resetOptions === true) {
      const dndOptions = TokenConsts.DND_DEFAULT_NAME_OPTIONS;
      this.object.settings.name.options.default = dndOptions.default;
      this.object.settings.name.options.attributes = dndOptions.attributes;
      this._resetOptions = false;

      this.render();
    }
    this.object.saveSettings();
  }

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

    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: Prepared Context",
      context
    );
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
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: _preparePartContext",
      partId
    );
    const partContext = await super._preparePartContext(
      partId,
      context,
      options
    );
    if (partId in partContext.tabs) {
      partContext.tab = partContext.tabs[partId];
    }
    switch (partId) {
      case "infoHelp":
        break;
      case "name": {
        // probably not the smartest way
        let langs = {};
        Object.assign(langs, {
          ["random"]: game.i18n.localize("tmold.name.random"),
        });
        partContext.languages = TokenConsts.LANGUAGES.reduce(
          (languages, language) =>
            Object.assign(languages, { [language]: language }),
          langs
        );
        partContext.numberStyles = TokenMoldForm.#NUMBER_SYTLES;
        partContext.prefixPositions = TokenMoldForm.#PREFIX_POSITIONS;
        partContext.nameReplaceOptions = TokenMoldForm.#NAME_REPLACE_OPTIONS;
        partContext.rollTableList = this.object._rollTableList;
        break;
      }
      case "systemSpecific":
        partContext.showCreatureSize =
          TokenConsts.SUPPORTED_CREATURESIZE.includes(game.system.id);
        partContext.showHP = TokenConsts.SUPPORTED_ROLLHP.includes(
          game.system.id
        );
        break;
      case "defaultConfig": {
        const PrototypeTokenConfig =
          foundry.applications.sheets.PrototypeTokenConfig;
        partContext.barAttributes = this.barAttributes;
        partContext.displayModes = PrototypeTokenConfig.DISPLAY_MODES;
        partContext.dispositions = PrototypeTokenConfig.TOKEN_DISPOSITIONS;
        break;
      }
      case "statOverlay":
        partContext.defaultIcons = TokenMoldForm.#DEFAULT_ICONS.reduce(
          (icons, icon) => Object.assign(icons, { [icon]: icon }),
          {}
        );
        break;
      case "footer":
        partContext.buttons = this.#prepareButtons();
        break;
    }
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: Prepared Part Context Complete",
      partContext
    );
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
      {
        type: "submit",
        icon: "fa-solid fa-floppy-disk",
        label: "Save & Close",
      },
    ];
  }

  /**
   * Modify the provided options passed to a render request.
   * @param {RenderOptions} options  Options which configure application rendering behavior
   * @protected
   * @override
   */
  _configureRenderOptions(options) {
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: _configureRenderOptions",
      options
    );
    super._configureRenderOptions(options);

    // Remove system specific tab when not supported
    if (!TokenConsts.SUPPORTED_SYSTEMS.includes(game.system.id)) {
      const index = options.parts.indexOf("systemSpecific");
      if (index > -1) {
        // only splice array when item is found
        options.parts.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #addOverlayAttribute(event, target) {
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: #addOverlayAttribute"
    );

    const clone = target.previousElementSibling.cloneNode(true);
    const inputs = clone.querySelectorAll("select");
    inputs.forEach((e) => {
      e.value = "";
    });

    target.before(clone);
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #removeOverlayAttribute(event, target) {
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: #removeOverlayAttribute"
    );

    const container = target.closest(".form-group");
    if (
      container.previousElementSibling.matches(
        ".form-group:not(.table-header)"
      ) ||
      container.nextElementSibling.matches(".form-group")
    ) {
      container.remove();
    }
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #addLanguageAttribute(event, target) {
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: #addLanguageAttribute"
    );

    const clone = target.previousElementSibling.cloneNode(true);
    const attributes = clone.querySelectorAll(".language-attribute");
    attributes.forEach((e) => {
      e.value = "";
    });
    const groups = clone
      .querySelector(".language-selection")
      .querySelectorAll(".language-group");
    groups.forEach((el, idx) => {
      if (idx > 0) {
        el.remove();
      }
    });
    const langSelection = clone.querySelector(".language-selection");
    langSelection.querySelector("input").value = "";
    langSelection.querySelector("select").value = "random";
    target.before(clone);
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #addLanguageValue(event, target) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #addLanguageValue");

    const clone = target.previousElementSibling.cloneNode(true);
    clone.querySelector("input").value = "";
    clone.querySelector("select").value = "random";
    target.before(clone);
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #removeLanguageValue(event, target) {
    TokenLog.log(
      TokenLog.LOG_LEVEL.Debug,
      "TokenMoldForm: #removeLanguageValue"
    );

    const container = target.closest(".form-group");

    let prev =
      container.previousElementSibling !== null &&
      container.previousElementSibling.matches(".form-group");
    // only delete if not last element
    if (prev || container.nextElementSibling.matches(".form-group")) {
      container.remove();
    } else {
      // alternatively delete whole attribute
      const parentContainer = container.closest(".language-attribute-group");
      if (
        parentContainer.previousElementSibling.matches(
          ".language-attribute-group"
        ) ||
        parentContainer.nextElementSibling.matches(".language-attribute-group")
      ) {
        parentContainer.remove();
      }
    }
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #rerollNames() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #rerollNames");

    const selected = canvas.tokens.controlled;
    let udata = [];
    for (const token of selected) {
      // Should this be checking for actorLink && unlinkedOnly?
      const newName = this.object.pickNewName(token.actor);
      udata.push({
        _id: token.id,
        name: newName,
      });
    }

    canvas.scene.updateEmbeddedDocuments("Token", udata);
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static #resetCounter() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #resetCounter");

    const sceneId = canvas.scene.id;

    this.object.counter[sceneId] = {};
    const tokens = canvas.scene.getEmbeddedCollection("Token");

    for (const token of tokens) {
      if (token.actorId) {
        this.object.counter[sceneId][token.actorId] = 0;
      }
    }

    ui.notifications.notify("Finished resetting counters");
  }

  /**
   * Process action
   * @this {TokenMoldForm}  The handler is called with the application as its bound scope
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - the capturing HTML element which defined a [data-action]
   * @returns {Promise<*>}
   * @private
   */
  static async #resetLanguages() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: #resetLanguages");

    this._resetOptions = true;
    await this.submit();
  }

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

    // I can't figure out what this is supposed to do
    // // TODO fix: .parentNode.parentNode
    // html.find(".overlay").on("change keyup", "input.icon", (ev) => {
    //   ev.target.parentNode.parentNode.getElementsByClassName("prev", )[0].innerHTML = "17&nbsp;" + ev.target.value;
    // });

    // TODO fix: .parentNode.parentNode.parentNode
    this.element
      .querySelector(".name-replace")
      .addEventListener("change", (ev) => {
        const nameRandomizer =
          ev.currentTarget.parentNode.parentNode.parentNode.querySelector(
            ".name-randomizer-options"
          );
        if (ev.currentTarget.value === "replace") {
          nameRandomizer.style.display = "block";
        } else {
          nameRandomizer.style.display = "none";
        }
      });

    // might need to trigger this once to get the UI right?
    //html.find(".name-replace").change();
    // manually do it:
    const nameReplace = this.element.querySelector(".name-replace");
    const nameRandomizer = this.element.querySelector(
      ".name-randomizer-options"
    );
    if (nameReplace.value === "replace") {
      nameRandomizer.style.display = "block";
    } else {
      nameRandomizer.style.display = "none";
    }

    // maybe find a better way to hide the button than by removing the icon?
    // maybe style.display = "none"
    if (game.system.id === "dnd5e") {
      const resetBtn = this.element.querySelector(".reset-lang");
      resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    }
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

    const types = Actor.implementation.TYPES.filter((x) => x !== "base");
    const shellMap = new Map(
      types.map((t) => [t, new Actor.implementation({ name: t, type: t })])
    );
    shellMap.forEach((value, key) => {
      const newAttributes = getAttributes(value.toObject().system).map((e) =>
        e.join(".")
      );
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

    newGroups.push({
      group: "",
      value: "",
      label: game.i18n.localize("tmold.stat.attributeNone"),
    });
    newGroups.push({
      group: "",
      value: "name",
      label: game.i18n.localize("tmold.stat.attributeName"),
    });

    //let groups = {};
    for (var attr of attributeList) {
      const split = attr[1].split(".");
      const document = attr[0];
      const group = split[0];

      let attribute = split.splice(1).join(".");
      newGroups.push({
        group: group,
        value: `system.${group}.${attribute}`,
        label: `${attribute} [${document}]`,
      });
    }

    // also populate with some calculated data for dnd5e, that is not in the template.json
    if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
      const npc = shellMap.get("npc");
      for (let skill of Object.keys(npc.toObject().system.skills)) {
        newGroups.push({
          group: "skills",
          value: `system.skills.${skill}.passive`,
          label: `${skill}.passive [character, npc]`,
        });
      }
      newGroups.push({
        group: "attributes",
        value: "system.attributes.ac.value",
        label: "ac.value [character, npc]",
      });
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
