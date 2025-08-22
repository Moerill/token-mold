import  TokenConsts  from "./token-consts.js"
import  TokenLog  from "./token-log.js";

export default class TokenMoldForm extends FormApplication {

    /**
     *
     * @param {any}    object
     * @param {object} options
     *
     */
    constructor(object, options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: constructor");
      super(object, options);
      this.settings = object.settings;
      this.barAttributes = object.barAttributes || [];
    }

   /**
     *
     * @return {ApplicationOptions}
     */
    static get defaultOptions() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: defaultOptions");
      const options = super.defaultOptions;
      options.template = "modules/token-mold/templates/token-mold.html";
      options.width = 420;
      options.height = 461;
      options.resizable = true;
      options.classes = ["token-mold"];
      options.title = "Token Mold";
      options.closeOnSubmit = false;
      options.submitOnClose = true;
      options.submitOnChange = false;
      options.tabs = [
        {
          navSelector: ".tabs",
          contentSelector: "form",
          initial: "Info",
        },
      ];
      return options;
    }

    /**
     *
     * @return {HeaderButton[]}
     */
    _getHeaderButtons() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _getHeaderButtons");
      let btns = super._getHeaderButtons();
      btns[0].label = "Save & Close";
      return btns;
    }

    /**
     *
     * @param {object}  options
     *
     * @return {Promise<FormApplication>}
     */
    async _onSubmit(options) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _onSubmit");
      const attrGroups = $(this.form).find(".attributes");
      let attrs = [];
      attrGroups.each((idx, e) => {
        const el = $(e);
        const icon = el.find(".icon").val();
        const value = el.find(".value").val();
        if (icon !== "" && value !== "") {
          attrs.push({
            icon: icon,
            path: value,
          });
        }
      });
      this.settings.overlay.attrs = attrs;

      this.settings.name.options.default = this.form
        .querySelector(".default-group")
        .querySelector(".language").value;
      const attributes = [];

      const langAttrGroups = this.form.querySelectorAll(".attribute-selection");

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
      super._onSubmit(options);
    }

    /**
     *
     * @param {Event}   event
     * @param {object}  formData
     *
     * @return {Promise<any>}
     */
    async _updateObject(event, formData) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _updateObject");
      let min = formData["name.options.min"],
        max = formData["name.options.max"];
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

      formData["name.options.min"] = min;
      formData["name.options.max"] = max;

      // For name prefix and suffix, if the value is only a space the formData doesn't pick it up, so check and manually set prior to merge.
      let prefix = $(this.form).find("input[name='name.number.prefix']").val();
      let suffix = $(this.form).find("input[name='name.number.suffix']").val();
      formData["name.number.prefix"] =
        formData["name.number.prefix"] !== prefix
          ? prefix
          : formData["name.number.prefix"];
      formData["name.number.suffix"] =
        formData["name.number.suffix"] !== suffix
          ? suffix
          : formData["name.number.suffix"];

      this.object.settings = foundry.utils.mergeObject(this.settings, formData);

      if (this._resetOptions === true) {
        const dndOptions = this.object.dndDefaultNameOptions;
        this.object.settings.name.options.default = dndOptions.default;
        this.object.settings.name.options.attributes = dndOptions.attributes;
        this._resetOptions = false;

        this.render();
      }
      this.object.saveSettings();
    }

    /**
     *
     * @return {object}
     */
    getData() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: getData");
      let data = {
        settings: this.settings,
      };
      data.numberStyles = {
        ar: "arabic numerals",
        alu: "alphabetic UPPER",
        all: "alphabetic LOWER",
        ro: "roman numerals",
      };
      data.barAttributes = this.barAttributes;
      data.actorAttributes = this._actorAttributes;
      data.displayModes = CONST.TOKEN_DISPLAY_MODES;
      data.dispositions = CONST.TOKEN_DISPOSITIONS;
      data.defaultIcons = this.defaultIcons;
      data.showCreatureSize = TokenConsts.SUPPORTED_CREATURESIZE.includes(game.system.id);
      data.showHP = TokenConsts.SUPPORTED_ROLLHP.includes(game.system.id);
      data.showSystem = this.object.systemSupported;
      data.languages = this.languages;
      data.rollTableList = this.object._rollTableList;
      data.visionLabel = game.i18n.localize("TOKEN.VisionEnabled");
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: Prepared data", data, this._rollTableList, );
      return data;
    }

    /**
     *
     * @return {object[]}
     */
    static get defaultAttrs() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: defaultAttrs");
      if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
        return [
          {
            icon: '&#xf06e;', // eye
            path: 'system.skills.prc.passive',
          },
          {
            icon: '&#xf3ed;', // shield-alt
            path: 'system.attributes.ac.value',
          },
        ];
      } else {
        return [];
      }
    }

    /**
     *
     * @return {object[]}
     */
    get defaultIcons() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: defaultIcons");
      return [
        "&#xf06e;", // eye
        "&#xf3ed;", //fas fa-shield-alt"></i>',
        "&#xf6cf;", //fas fa-dice-d20"></i>',
        "&#xf21e;", //fas fa-heartbeat"></i>',
        "&#xf6e8;", //fas fa-hat-wizard"></i>',
        "&#xf54b;", //fas fa-shoe-prints"></i>',
        "&#xf554;", //fas fa-walking"></i>',
        "&#xf70c;", //fas fa-running"></i>',
        "&#xf51e;", //fas fa-coins"></i>',
        "&#xf619;", //fas fa-poop"></i>',
        "&#xf290;", //fas fa-shopping-bag"></i>',
        "&#xf53a;", //fas fa-money-bill-wave"></i>',
        "&#xf0f2;", //fas fa-suitcase"></i>',
        "&#xf06d;", //fas fa-fire"></i>',
        "&#xf1b0;", //fas fa-paw"></i>',
        "&#xf787;", //fas fa-carrot"></i>',
        "&#xf5d7;", //fas fa-bone"></i>',
        "&#xf6d7;", //fas fa-drumstick-bite"></i>',
        "&#xf5d1;", //fas fa-apple-alt"></i>',
        "&#xf6de;", //fas fa-fist-raised"></i>',
        "&#xf669;", //fas fa-jedi"></i>',
        "&#xf753;", //fas fa-meteor"></i>',
        "&#xf186;", //fas fa-moon"></i>',
        "&#xf135;", //fas fa-rocket"></i>'
        "&#xf5dc;", // brain
        "&#xf1ae;", // child
      ];
    }

    /**
     *
     * @return {any}
     */
    get languages() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: languages");
      return this.object.languages;
    }

    /**
     *
     * @param {jQuery}  html
     *
     */
    activateListeners(html) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: activateListeners");
      super.activateListeners(html);

      html.find(".add-attribute").on("click", (ev) => {
        const addBtn = $(ev.target);
        const clone = addBtn.prev().clone();
        clone.find("select").val("");
        addBtn.before(clone);
      });

      html.on("click", ".remove", (ev) => {
        const container = $(ev.currentTarget).closest(".form-group");

        if (container.prev('.form-group:not(".header")').length > 0 || container.next(".form-group").length > 0) {
          container.remove();
        }
      });

      html.find(".overlay").on("change keyup", "input.icon", (ev) => {
        ev.target.parentNode.parentNode.getElementsByClassName("prev", )[0].innerHTML = "17&nbsp;" + ev.target.value;
      });

      html.find(".name-replace").on("change", (ev) => {
        const nameRandomizer = ev.currentTarget.parentNode.parentNode.querySelector(".name-randomizer-options", );
        if (ev.currentTarget.value === "replace") {
          nameRandomizer.style.display = "block";
        } else {
          nameRandomizer.style.display = "none";
        }
      });
      html.find(".name-replace").change();

      html.on("click", ".add-language-value", (ev) => {
        const addBtn = $(ev.target);
        const clone = addBtn.prev().clone();
        clone.find("input").val("");
        clone.find("select").val("random");
        addBtn.before(clone);
      });

      html.on("click", ".add-language-attribute", (ev) => {
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
        resetBtn[0].innerHTML = '<i class="fas fa-undo"></i>';
        resetBtn.on("click", (ev) => {
          this._resetOptions = true;
          this._onSubmit(ev);
        });
      }

      html[0].querySelector(".reroll-names").addEventListener("click", (ev) => {
        const selected = canvas.tokens.controlled;
        let udata = [];
        for (const token of selected) {
          // Should this be checking for actorLink && unlinkedOnly?
          const newName = this.object._pickNewName(token.actor);
          udata.push({
            _id: token.id,
            name: newName
          });
        }

        canvas.scene.updateEmbeddedDocuments("Token", udata);
      });

      html.on("click", ".reset-counter", async (ev) => {
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
     */
    get _actorAttributes() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldForm: _actorAttributes");
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
      let groups = {};
      for (var attr of attributeList) {
        const split = attr[1].split(".");
        const document = attr[0];
        const group = split[0];
        if (groups[group] === undefined) {
          groups[group] = [];
        }
        groups[group].push({
          document: document,
          attribute: split.splice(1).join("."),
        });
      }
      // also populate with some calculated data for dnd5e, that is not in the template.json
      if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
        let sortFun = function (a, b) {
          if (a.attribute > b.attribute) {
            return 1;
          } else if (a.attribute < b.attribute) {
            return -1;
          }
          return 0;
        };
        const npc = shellMap.get("npc");
        for (let skill of Object.keys(npc.toObject().system.skills)) {
          groups["skills"].push({
            document: "character, npc",
            attribute: `${skill}.passive`,
          });
        }
        groups["skills"].sort(sortFun);
        groups["attributes"].push({
          document: "character, npc",
          attribute: "ac.value",
        });
        groups["attributes"].sort(sortFun);
      }
      return groups;
    }
  }
