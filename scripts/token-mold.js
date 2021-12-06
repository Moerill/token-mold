import { TokenMoldOverlay } from "./overlay.js";
export default class TokenMold {
  constructor() {
    this.counter = {};
    this._rollTableList = {};
    this.dict = null;
    this.initHooks();
  }

  initHooks() {
    Hooks.on("renderActorDirectory", (app, html, data) => {
      if (game.user.isGM) this._hookActorDirectory(html);
    });

    this.registerSettings();
    this.loadSettings();
    this.systemSupported = /dnd5e|pf2e|sfrpg/.exec(game.data.system.id) !== null;

    Hooks.on("hoverToken", (token, hovered) => {
      if (!token || !token.actor) return;

      // Don't show for permission lvl lower than observer
      if (token.actor.permission < CONST.ENTITY_PERMISSIONS.OBSERVER) return;

      if (
        canvas.hud.TokenMold === undefined ||
        this.data.overlay.attrs.length === 0
      )
        return;

      if (hovered && this.data.overlay.use === true) {
        canvas.hud.TokenMold.attrs = this.data.overlay.attrs;
        canvas.hud.TokenMold.bind(token);
      } else {
        canvas.hud.TokenMold.clear();
      }
    });

    Hooks.on("ready", async () => {
      Hooks.on("renderHeadsUpDisplay", async (app, html, data) => {
        html.append('<template id="token-mold-overlay"></template>');
        canvas.hud.TokenMold = new TokenMoldOverlay();
      });

      if (!game.user.isGM) return;

      Hooks.on("deleteToken", (...args) => {
        if (!canvas.hud.TokenMold) return;
        canvas.hud.TokenMold.clear();
      });

      this._hookPreTokenCreate();
      this.barAttributes = await this._getBarAttributes();
      this._loadDicts();

      await this._getRolltables();

      await this._loadTable();
    });
  }

  get languages() {
    return [
      "afrikaans",
      "albanian",
      "armenian",
      "azeri",
      "croatian",
      "czech",
      "danish",
      "dutch",
      "english",
      "estonian",
      "finnish",
      "french",
      "georgian",
      "german",
      "greek",
      "hungarian",
      "icelandic",
      "indonesian",
      "irish",
      "italian",
      "latvian",
      "lithuanian",
      "norwegian",
      "polish",
      "portuguese",
      "romanian",
      "russian",
      "sicilian",
      "slovak",
      "slovenian",
      "spanish",
      "swedish",
      "turkish",
      "welsh",
      "zulu",
    ];
  }

  /**
   * Only loads dicts if the option is set *and* they're not already loaded
   * possible TODO: maybe check if dict is needed?
   */
  async _loadDicts() {
    // Remove if replace is unset
    if (!game.user || !game.user.isGM || this.data.name.replace !== "replace") {
      // Useful to free up memory? its "just" up to 17MB...
      // delete this.dict;
      return;
    }
    if (!this.dict) this.dict = {};
    const options = this.data.name.options;
    let languages = this.languages;
    for (let lang of languages) {
      if (this.dict[lang]) continue;
      this.dict[lang] = (await import(`./dict/${lang}.js`)).lang;
    }
  }

  async _loadTable() {
    let document;
    try {
      document = await fromUuid(this.data.name.prefix.table);
    } catch (error) {
      // Reset if table not found..
      document = await fromUuid(this.defaultSettings().name.prefix.table);
      this.data.name.prefix.table = this.defaultSettings().name.prefix.table;
    }

    this.adjectives = document;
  }

  // Gets a list of all Rollable Tables available to choose adjectives from.
  async _getRolltables() {
    const rollTablePacks = game.packs.filter(
      (e) => e.documentName === "RollTable"
    );

    this._rollTableList = {};
    if (game.tables.size > 0) this._rollTableList["World"] = [];
    for (const table of game.tables) {
      this._rollTableList["World"].push({
        name: table.name,
        uuid: `RollTable.${table.id}`,
      });
    }
    for (const pack of rollTablePacks) {
      const idx = await pack.getIndex();
      this._rollTableList[pack.metadata.label] = [];
      const tableString = `Compendium.${pack.collection}.`;
      for (let table of idx) {
        this._rollTableList[pack.metadata.label].push({
          name: table.name,
          uuid: tableString + table._id,
        });
      }
    }

    console.debug("Token Mold | Rollable Tables found", this._rollTableList);
  }

  async _hookActorDirectory(html) {
    this.section = document.createElement("section");
    this.section.classList.add("token-mold");
    // Add menu before directory header
    const dirHeader = html[0].querySelector(".directory-header");
    dirHeader.parentNode.insertBefore(this.section, dirHeader);

    if (this.data !== undefined) this._renderActorDirectoryMenu();
  }

  async _renderActorDirectoryMenu() {
    const section = this.section;
    section.insertAdjacentHTML(
      "afterbegin",
      `
        <h3>Token Mold</h3>
        <label class='label-inp' title='(De-)activate Name randomizing'>
            <input class='name rollable' type='checkbox' name='name.use' ${
              this.data.name.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;Name</span>
        </label>
        ${
          game.data.system.id === "dnd5e"
            ? `
        <label class='label-inp' title='(De-)activate Hit Point rolling'>
            <input class='hp rollable' type='checkbox' name='hp.use' ${
              this.data.hp.use ? "checked" : ""
            } ><span><span class='checkmark'></span>&nbsp;HP</span>
        </label>`
            : ``
        }
        <label class='label-inp' title='(De-)activate Token Config Overwrite'>
            <input class='config rollable' type='checkbox' name='config.use' ${
              this.data.config.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;Config</span>
        </label>
        <label class='label-inp' title='(De-)activate Stat Overlay On Hover'>
            <input class='config rollable' type='checkbox' name='overlay.use' ${
              this.data.overlay.use ? "checked" : ""
            }><span><span class='checkmark'></span>&nbsp;Overlay</span>
        </label>


        <a class='refresh-selected' title="Reapplies all settings to selected tokens as if those were replaced onto the scene."><i class="fas fa-sync-alt"></i></a>
        <a class='token-rand-form-btn' title='Settings'><i class="fa fa-cog"></i></a>
        <h2></h2>
        `
    );

    const inputs = section.querySelectorAll('input[type="checkbox"]');
    for (let checkbox of inputs) {
      checkbox.addEventListener("change", (ev) => {
        setProperty(this.data, ev.target.name, ev.target.checked);
        this.saveSettings();
      });
    }

    this.section
      .querySelector(".refresh-selected")
      .addEventListener("click", (ev) => this._refreshSelected());
    this.section
      .querySelector(".token-rand-form-btn")
      .addEventListener("click", (ev) => {
        if (this.form === undefined) this.form = new TokenMoldForm(this);
        this.form.render(true);
      });
  }

  /**
   * Always update all checkboxes present. For two reasons:
   *  - Other connected user  changes smth, so we have to update our view as well
   *  - Popout sidebar needs to update on change as well
   */
  _updateCheckboxes() {
    const inputs = document.querySelectorAll("section.token-mold input");
    inputs.forEach((el) => {
      const name = el.name;
      el.checked = getProperty(this.data, name);
    });
  }

  _hookPreTokenCreate() {
    Hooks.on("preCreateToken", (token, data, options, userId) => {
      const scene = token.parent;
      console.log(token, token.data, data);
      this._setTokenData(scene, data);
      token.data.update(data);
    });
  }

  /**
   *
   * @param {*} scene
   * @param {*} data TokenData
   */
  _setTokenData(scene, data) {
    const actor = game.actors.get(data.actorId);

    if (!actor || (data.actorLink && this.data.unlinkedOnly))
      // Don't for linked token
      return data;

    // Do this for all tokens, even player created ones
    if (this.data.size.use && this.systemSupported === true)
      this._setCreatureSize(data, actor, scene.id);

    if (this.counter[scene.id] === undefined) this.counter[scene.id] = {};

    if (this.data.name.use) {
      const newName = this._modifyName(data, actor, scene.id);
      data.name = newName;
      setProperty(data, "actorData.name", newName);
    }

    if (game.data.system.id === "dnd5e") {
      if (this.data.hp.use) this._rollHP(data, actor);
    }

    if (this.data.config.use) this._overwriteConfig(data, actor);

    return data;
  }

  async _refreshSelected() {
    const selected = canvas.tokens.controlled;
    let udata = [];
    for (const token of selected)
      udata.push(this._setTokenData(canvas.scene, duplicate(token.data)));

    canvas.scene.updateEmbeddedDocuments("Token", udata);
  }

  _overwriteConfig(data, actor) {
    // data = mergeObject(data, this.data.config);
    console.log(data, this.data.config);
    for (let [key, value] of Object.entries(this.data.config)) {
      if (value.use !== true) continue;
      if (value.value !== undefined) {
        data[key] = value.value;
      } else if (value.min !== undefined && value.max !== undefined) {
        let val = data[key] || 1;
        data[key] =
          (val *
            Math.floor(
              (Math.random() * (value.max - value.min) + value.min) * 100
            )) /
          100;
      } else if (
        value.attribute !== undefined &&
        (value.attribute === "" ||
          getProperty(actor, "data.data." + value.attribute) !== undefined)
      ) {
        data[key].attribute = value.attribute;
      } else if (
        value.attribute === undefined &&
        value.min === undefined &&
        value.max === undefined &&
        value.value === undefined
      ) {
        // Random mirroring
        data[key] = Boolean(Math.round(Math.random()));
      }
    }
  }

  _rollHP(data, actor) {
    const formula = actor.data.data.attributes.hp.formula;
    if (formula) {
      const r = new Roll(formula.replace(" ", ""));
      r.roll({async: false});
      if (this.data.hp.toChat)
        r.toMessage({
          rollMode: "gmroll",
          flavor: data.name + " rolls for hp!",
        });
      // Make sure hp is at least 1
      const val = Math.max(r.total, 1);
      setProperty(data, "actorData.data.attributes.hp.value", val);
      setProperty(data, "actorData.data.attributes.hp.max", val);
    } else
      ui.notifications.warn("Can not randomize hp. HP formula is not set.");
    return;
  }

  _modifyName(data, actor, sceneId) {
    let name = actor.data.token.name;

    if (this.data.name.replace !== "" && this.data.name.replace !== "nothing")
      name = "";

    let numberSuffix = "";
    if (this.data.name.number.use) {
      let number = 0;
      // Check if number in session database
      if (this.counter[sceneId][data.actorId] !== undefined)
        number = this.counter[sceneId][data.actorId];
      else {
        // Extract number from last created token with the same actor ID
        const sameTokens =
          game.scenes
            .get(sceneId)
            .data.tokens.filter((e) => e.actorId === data.actorId) || [];
        if (sameTokens.length !== 0) {
          const lastTokenName = sameTokens[sameTokens.length - 1].name;
          // Split by prefix and take last element
          let tmp = lastTokenName.split(this.data.name.number.prefix).pop();
          if (tmp !== "")
            // Split by suffix and take first element
            number = tmp.split(this.data.name.number.suffix)[0];
        }
      }
      // Convert String back to number
      switch (this.data.name.number.type) {
        case "ar":
          number = parseInt(number);
          break;
        case "alu":
          number = this._dealphabetize(number.toString(), "upper");
          break;
        case "all":
          number = this._dealphabetize(number.toString(), "lower");
          break;
        case "ro":
          number = this._deromanize(number);
          break;
      }
      // If result is no number, set to zero
      if (isNaN(number)) number = 0;
      else {
        // count upwards
        if (this.data.name.number.range > 1)
          number += Math.ceil(Math.random() * this.data.name.number.range);
        else number++;
      }

      switch (this.data.name.number.type) {
        case "alu":
          number = this._alphabetize(number, "upper");
          break;
        case "all":
          number = this._alphabetize(number, "lower");
          break;
        case "ro":
          number = this._romanize(number);
          break;
      }

      this.counter[sceneId][data.actorId] = number;

      numberSuffix =
        this.data.name.number.prefix + number + this.data.name.number.suffix;
    }

    if (this.data.name.replace === "replace")
      name = this._pickNewName(actor) + " " + name;

    if (this.data.name.prefix.use) {
      const adj =
        this.adjectives.results._source[
          Math.floor(this.adjectives.results.size * Math.random())
        ].text;
      if (this.data.name.prefix.position === "back") name = name + " " + adj;
      else name = adj + " " + name;
    }
    // name = this.adjectives[Math.floor(Math.random() * this.adjectives.length)] + " " + name;

    name += numberSuffix;

    return name;
  }

  _chooseWeighted(items) {
    var keys = Object.keys(items);
    var vals = Object.values(items);
    var sum = vals.reduce((accum, elem) => accum + elem, 0);
    var accum = 0;
    vals = vals.map((elem) => (accum = elem + accum));
    var rand = Math.random() * sum;
    return keys[vals.filter((elem) => elem <= rand).length];
  }

  _chgCase(txt, fromCase, toCase) {
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

  /**
   * Thanks for 'trdischat' for providing this awesome name generation algorithm!
   * Base idea:
   *  - Choose a language (depending on settings chosen)
   *  - Choose a random starting trigram for the language, weighted by frequency used
   *  - Go on choosing letters like before, using the previous found letter as starting letter of the trigram, until maximum is reached
   * @param {*} actor
   */
  _pickNewName(actor) {
    const attributes = this.data.name.options.attributes || [];

    let lang;
    for (let attribute of attributes) {
      const langs = attribute.languages;
      const val = String(
        getProperty(actor.data, attribute.attribute)
      ).toLowerCase();

      lang = langs[val];

      if (lang !== undefined) break;
    }

    if (lang === undefined) lang = this.data.name.options.default;

    if (lang === "random") {
      const keys = Object.keys(this.dict);
      lang = keys[Math.floor(Math.random() * keys.length)];
    }

    const minNameLen = this.data.name.options.min || 6;
    const maxNameLen = this.data.name.options.max || 9;

    const nameLength =
      Math.floor(Math.random() * (maxNameLen - minNameLen + 1)) + minNameLen;
    let newName = this._chooseWeighted(this.dict[lang].beg);
    const ltrs = (x, y, b) =>
      x in b && y in b[x] && Object.keys(b[x][y]).length > 0 ? b[x][y] : false;

    for (let i = 4; i <= nameLength; i++) {
      const c1 = newName.slice(-2, -1);
      const c2 = newName.slice(-1);
      const br = i == nameLength ? this.dict[lang].end : this.dict[lang].mid;
      const c3 = ltrs(c1, c2, br) || ltrs(c1, c2, this.dict[lang].all) || {};
      if (c1 == c2 && c1 in c3) delete c3[c1];
      if (Object.keys(c3).length == 0) break;
      newName = newName + this._chooseWeighted(c3);
    }

    newName =
      newName[0] +
      this._chgCase(
        newName.slice(1),
        this.dict[lang].upper,
        this.dict[lang].lower
      );
    return newName;
  }

  _dealphabetize(num, letterStyle) {
    if (num === "0") return 0;
    let ret = 0;
    const startValue = {
      upper: 64,
      lower: 96,
    }[letterStyle];

    for (const char of num) ret += char.charCodeAt(0) - startValue;

    return ret;
  }

  _alphabetize(num, letterStyle) {
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
  _romanize(num) {
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
  _deromanize(rom) {
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

  // Scale tokens according to set creature size
  // DnD 5e and PF2e only
  _setCreatureSize(data, actor, sceneId) {
    const sizes = {
      tiny: 0.5,
      sm: 0.8,
      med: 1,
      lg: 2,
      huge: 3,
      grg: 4,
    };
    const aSize = actor.data.data.traits.size;
    let tSize = sizes[aSize];

    // if size could not be found return
    if (tSize === undefined) return;

    const scene = game.scenes.get(sceneId);

    // If scene has feet/ft as unit, scale accordingly
    //  5 ft => normal size
    // 10 ft => double
    // etc.
    if (scene.data.gridType && /(ft)|eet/.exec(scene.data.gridUnits) !== null)
      tSize *= 5 / scene.data.gridDistance;

    if (tSize < 1) {
      data.scale = tSize;
      data.width = data.height = 1;
    } else {
      const int = Math.floor(tSize);

      // Make sure to only have integers
      data.width = data.height = int;
      // And scale accordingly
      data.scale = tSize / int;
      // Set minimum scale 0.25
      data.scale = Math.max(data.scale, 0.25);
    }
  }

  registerSettings() {
    // register settings
    game.settings.register("Token-Mold", "everyone", {
      name: "Token Mold Settings",
      hint: "Settings definitions for the Token Mold Module",
      default: this.defaultSettings(),
      type: Object,
      scope: "world",
      onChange: (data) => {
        this.data = data;
        this._updateCheckboxes();
      },
    });
  }

  defaultSettings() {
    console.log("Token Mold | Loading default Settings");
    return {
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
        // data: {
        //     vision: false,
        //     displayBars: 40,
        //     displayName: 40,
        //     disposition: 0
        // },
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
        attrs: TokenMoldForm.defaultAttrs,
      },
    };
  }

  loadSettings() {
    this.data = game.settings.get("Token-Mold", "everyone");
    // Check for old data
    if (this.data.config.data !== undefined) {
      for (let [key, value] of Object.entries(this.data.config.data)) {
        this.data.config[key] = {
          use: true,
          value: value,
        };
      }
      delete this.data.config.data;
      this.saveSettings();
    }
    if (
      getProperty(this.data, "overlay.attrs") &&
      this.data.overlay.attrs.length === 0
    )
      delete this.data.overlay.attrs;
    if (
      getProperty(this.data, "name.options.attributes") &&
      this.data.name.options.attributes.length === 0
    )
      delete this.data.name.options.attributes;
    this.data = mergeObject(this.defaultSettings(), this.data);
    if (game.data.system.id === "dnd5e") {
      if (this.data.name.options === undefined) {
        const dndOptions = this.dndDefaultNameOptions;
        this.data.name.options.default = dndOptions.default;
        this.data.name.options.attributes = dndOptions.attributes;
      }
    }
    this._loadDicts();
    console.log("Token Mold | Loading Settings", this.data);
  }

  get dndDefaultNameOptions() {
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
        //     attribute: "data.details.race",
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
          attribute: "data.details.type",
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

  async saveSettings() {
    if (
      !this.adjectives ||
      this.adjectives.uuid !== this.data.name.prefix.table
    )
      this._loadTable();

    await game.settings.set("Token-Mold", "everyone", this.data);
    this._loadDicts();
    console.log("Token Mold | Saving Settings", this.data);
  }

  async _getBarAttributes() {
    const types = CONFIG.Actor.documentClass.metadata.types;
    let barData = { bar: {}, value: {} };
    let addElement = (obj, key, val) => {
      if (obj[key]) obj[key] += ", " + val;
      else obj[key] = val;
    };
    for (const type of types) {
      const { bar, value } = TokenDocument.getTrackedAttributes(
        new CONFIG.Actor.documentClass({ type: type, name: "tmp" }).data.data
      );
      for (const val of bar) {
        addElement(barData.bar, val.join("."), type);
      }
      for (const val of value) {
        addElement(barData.value, val.join("."), type);
      }
    }
    return barData;
  }
}

class TokenMoldForm extends FormApplication {
  constructor(object, options) {
    super(object, options);
    this.data = object.data;
    this.barAttributes = object.barAttributes || [];
  }

  static get defaultOptions() {
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

  _getHeaderButtons() {
    let btns = super._getHeaderButtons();
    btns[0].label = "Save & Close";
    return btns;
  }

  async _onSubmit(ev) {
    const attrGroups = $(this.form).find(".attributes");
    let attrs = [];
    attrGroups.each((idx, e) => {
      const el = $(e);
      const icon = el.find(".icon").val(),
        value = el.find(".value").val();
      if (icon !== "" && value !== "")
        attrs.push({
          icon: icon,
          path: value,
        });
    });
    this.data.overlay.attrs = attrs;

    this.data.name.options.default = this.form
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

    this.data.name.options.attributes = attributes;
    super._onSubmit(ev);
  }

  async _updateObject(event, formData) {
    let min = formData["name.options.min"],
      max = formData["name.options.max"];
    if (min < 0) min = 0;
    if (max < 0) max = 0;

    if (min > max) {
      const tmp = min;
      (min = max), (max = tmp);
    }

    formData["name.options.min"] = min;
    formData["name.options.max"] = max;

    // For name prefix and suffix, if the value is only a space the formData doesn't pick it up, so check and manually set prior to merge.
    let prefix = $(this.form).find("input[name='name.number.prefix']").val();
    let suffix = $(this.form).find("input[name='name.number.suffix']").val();
    formData["name.number.prefix"] = formData["name.number.prefix"] !== prefix ? prefix : formData["name.number.prefix"];
    formData["name.number.suffix"] = formData["name.number.suffix"] !== suffix ? suffix : formData["name.number.suffix"];

    this.object.data = mergeObject(this.data, formData);

    if (this._resetOptions === true) {
      // this.object.data.name.options = this.object.dndDefaultNameOptions;

      const dndOptions = this.object.dndDefaultNameOptions;
      this.object.data.name.options.default = dndOptions.default;
      this.object.data.name.options.attributes = dndOptions.attributes;
      this._resetOptions = false;

      this.render();
    }
    this.object.saveSettings();
  }

  getData() {
    let data = {
      data: this.data,
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
    data.showHP = game.data.system.id === "dnd5e";
    data.showSystem = this.object.systemSupported;
    data.languages = this.languages;
    data.rollTableList = this.object._rollTableList;
    console.debug("Token Mold | Prepared data", data, this._rollTableList);
    return data;
  }

  static get defaultAttrs() {
    if (game.data.system.id === "dnd5e") {
      return [
        {
          value: "data.attributes.ac.value",
          label: "Armor Class",
          icon: '<i class="fas fa-eye"></i>',
        },
        {
          value: "data.skills.prc.passive",
          label: "Passive Perception",
          icon: '<i class="fas fa-shield-alt"></i>',
        },
      ];
    } else
      return [
        {
          icon: '<i class="fas fa-eye"></i>',
          value: "",
        },
      ];
  }

  get defaultIcons() {
    return [
      "&#xf06e;", // eye
      "&#xf3ed; ", //fas fa-shield-alt"></i>',
      "&#xf6cf; ", //fas fa-dice-d20"></i>',
      "&#xf21e; ", //fas fa-heartbeat"></i>',
      "&#xf6e8; ", //fas fa-hat-wizard"></i>',
      "&#xf54b; ", //fas fa-shoe-prints"></i>',
      "&#xf554; ", //fas fa-walking"></i>',
      "&#xf70c; ", //fas fa-running"></i>',
      "&#xf51e; ", //fas fa-coins"></i>',
      "&#xf619; ", //fas fa-poop"></i>',
      "&#xf290; ", //fas fa-shopping-bag"></i>',
      "&#xf53a;", //fas fa-money-bill-wave"></i>',
      "&#xf0f2;", // fas fa-suitcase"></i>',
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

  get languages() {
    return this.object.languages;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-attribute").on("click", (ev) => {
      const addBtn = $(ev.target);
      const clone = addBtn.prev().clone();
      clone.find("select").val("");
      addBtn.before(clone);
    });

    html.on("click", ".remove", (ev) => {
      const container = $(ev.currentTarget).closest(".form-group");

      if (
        container.prev('.form-group:not(".header")').length > 0 ||
        container.next(".form-group").length > 0
      )
        container.remove();
    });

    html.find(".overlay").on("change keyup", "input.icon", (ev) => {
      ev.target.parentNode.parentNode.getElementsByClassName(
        "prev"
      )[0].innerHTML = "17&nbsp;" + ev.target.value;
    });

    html.find(".name-replace").on("change", (ev) => {
      const nameRandomizer =
        ev.currentTarget.parentNode.parentNode.querySelector(
          ".name-randomizer-options"
        );
      if (ev.currentTarget.value === "replace")
        nameRandomizer.style.display = "block";
      else nameRandomizer.style.display = "none";
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
      if (prev.length > 0 || container.next(".form-group").length > 0)
        container.remove();
      else {
        // alternatively delete whole attribute
        const parentContainer = container.closest(".attribute-group");
        if (
          parentContainer.prev('.attribute-group:not(".default")').length > 0 ||
          parentContainer.next('.attribute-group:not(".default")').length > 0
        ) {
          parentContainer.remove();
        }
      }
    });

    if (game.system.id === "dnd5e") {
      const resetBtn = html.find(".reset");
      resetBtn[0].innerHTML = '<i class="fas fa-undo"></i>';
      let resetLangs = (ev) => {};
      resetBtn.on("click", (ev) => {
        this._resetOptions = true;
        this._onSubmit(ev);
      });
    }

    html[0].querySelector(".reroll-names").addEventListener("click", (ev) => {
      const tokens = canvas.tokens.controlled;
      let udata = [];
      for (let token of tokens) {
        const newName = this.object._pickNewName(token.actor.data);
        udata.push({
          _id: token.id,
          name: newName,
          "actorData.name": newName,
        });
      }

      canvas.scene.updateEmbeddedDocuments("Token", udata);
    });

    html.on("click", ".reset-counter", async (ev) => {
      const sceneId = canvas.scene.id;

      this.object.counter[sceneId] = {};
      const tokens = canvas.scene.getEmbeddedCollection("Token");

      for (const token of tokens)
        if (token.actorId) this.object.counter[sceneId][token.actorId] = 0;

      ui.notifications.notify("Finished resetting counters");
    });
  }

  get _actorAttributes() {
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

    let barAttributes = [];
    for (let type in game.system.model.Actor) {
      let newAttributes = getAttributes(game.system.model.Actor[type]).map(
        (e) => e.join(".")
      );
      // find duplicates
      for (let attr of newAttributes) {
        // Search if attribute already found
        let duplicate = barAttributes.find((el) => el[1].includes(attr));
        // If not found,  add to attributes
        if (duplicate === undefined) {
          barAttributes.push([type].concat(attr));
        } else {
          // if found add actor type to list
          duplicate[0] += ", " + type;
        }
      }
    }
    // Sort in groups by first element
    let groups = {};
    for (var attr of barAttributes) {
      const split = attr[1].split(".");
      const document = attr[0];
      const group = split[0];
      if (groups[group] === undefined) groups[group] = [];
      groups[group].push({
        document: document,
        attribute: split.splice(1).join("."),
      });
    }
    // also populate with some calculated data for dnd5e, that is not in the template.json
    if (game.data.system.id === "dnd5e") {
      let sortFun = function (a, b) {
        if (a.attribute > b.attribute) return 1;
        else if (a.attribute < b.attribute) return -1;
        return 0;
      };
      for (let skill of Object.keys(game.system.model.Actor["npc"].skills)) {
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
