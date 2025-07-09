import  TokenConsts  from "./token-consts.js"
import  TokenLog  from "./token-log.js";
import  TokenMoldForm  from "./token-mold-form.js";
import  TokenMoldOverlay  from "./token-mold-overlay.js";

export default class TokenMold {
  constructor() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMold: constructor");
    this.counter = {};
    this._rollTableList = [];
    this.dict = null;

    this.initHooks();
  }



  /**
   *
   */
  initHooks() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "initHooks");

    // params: ActorDirectory, DOM, object, object
    Hooks.on("renderActorDirectory", (app, element, context, options) => {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "renderActorDirectory");
      if (game.user.isGM) {
        //if (options.parts && !options.parts.includes("token-mold")) return;
        this._hookActorDirectory(element, options);
      }
    });

    this.#registerSettings();
    this.#loadSettings();

    // params: PlaceableObject, boolean
    Hooks.on("hoverToken", (token, hovered) => {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "hoverToken");
      if (!token || !token.actor) {
        return;
      }

      // Don't show for permission lvl lower than observer
      if (token.actor.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
        return;
      }

      if (canvas.hud.TokenMoldHUD === undefined || this.settings.overlay.attrs.length === 0 || (token.document.actorLink && !this.settings.enableOverlayForLinked)) {
        return;
      }

      if (hovered && this.settings.overlay.use === true) {
        canvas.hud.TokenMoldHUD.attrs = this.settings.overlay.attrs;
        canvas.hud.TokenMoldHUD.bind(token);
      } else {
        canvas.hud.TokenMoldHUD.close();
      }
    });

    Hooks.on("renderHeadsUpDisplayContainer", (app, element, context, options) => {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "renderHeadsUpDisplayContainer");
      //if (options.parts && !options.parts.includes("token-mold-overlay")) return;
      // We should be using options.parts for this, but I'm not sure how
      // const existingTemplate = html.querySelector(".token-mold-overlay");
      // if (existingTemplate !== null)
      // {
      //   return;
      // }

      // necessary? - doesn't appear to be.
      //html.insertAdjacentHTML("beforeend","<template id='token-mold-overlay'></template>");
      canvas.hud.TokenMoldHUD = new TokenMoldOverlay();
    });

    Hooks.once("ready", async () => {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "ready");
      // params: Application, DOM, object, object


      if (!game.user.isGM) {
        return;
      }

      // params: Document, DatabaseDeleteOperation, string
      Hooks.on("deleteToken", (token, options, userId) => {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "deleteToken");
        if (!canvas.hud.TokenMoldHUD) return;
        canvas.hud.TokenMoldHUD.close();
      });

      // params: Document, object, DatabaseCreateOperation, string
      Hooks.on("preCreateToken", (token, data, options, userId) => {
        const scene = token.parent;
        const newData = this.#setTokenData(scene, data);
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "preCreateToken", token, data, newData, );
        token.updateSource(newData);
      });

      // params: Document, DatabaseCreateOperation, string
      Hooks.on("createToken", (token, options, userId) => {
        if (userId !== game.userId) {
          // filter to single user
          return;
        }
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "createToken", token, );
        this._setHP(token);
      });

      this.barAttributes = await this.#getBarAttributes();
      await this.#loadDicts();

      await this.#getRolltables();

      await this.#loadTable();
    });
  }

  // /**
  //  *
  //  * @returns {string[]}
  //  * @public
  //  */
  // get languages() {
  //   TokenLog.log(TokenLog.LOG_LEVEL.Debug, "languages");
  //   return ;
  // }

  /**
   * Only loads dicts if the option is set *and* they're not already loaded
   * possible TODO: maybe check if dict is needed?
   *
   * @returns {Promise<any>}
   * @private
   */
  async #loadDicts() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#loadDicts");
    // Remove if replace is unset
    if (!game.user || !game.user.isGM || this.settings.name.replace !== "replace") {
      // Useful to free up memory? its "just" up to 17MB...
      // delete this.dict;
      return;
    }
    if (!this.dict) {
      this.dict = {};
    }
    let languages = TokenConsts.LANGUAGES;
    for (let lang of languages) {
      if (this.dict[lang]) {
        continue;
      }
      this.dict[lang] = (await import(`./dict/${lang}.js`)).lang;
    }
  }

  /**
   *
   * @returns {Promise<any>}
   * @private
   */
  async #loadTable() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#loadTable");
    let document;
    try {
      document = await fromUuid(this.settings.name.prefix.table);
    } catch (error) {
      // Reset if table not found..
      document = await fromUuid(this.#defaultSettings().name.prefix.table);
      this.settings.name.prefix.table = this.#defaultSettings().name.prefix.table;
    }

    // if fromUuid() doesn't throw and document is still not valid; reset
    if (!document)
    {
      // Reset if table not found..
      document = await fromUuid(this.#defaultSettings().name.prefix.table);
      this.settings.name.prefix.table = this.#defaultSettings().name.prefix.table;
    }

    this.adjectives = document;
  }

  /**
   * Gets a list of all Rollable Tables available to choose adjectives from.
   *
   * @returns {Promise<any>}
   * @private
   */
  async #getRolltables() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#getRolltables");
    // Filter out everything except TokenMold tables
    const rollTablePacks = game.packs.filter((e) => e.documentName === "RollTable" && e.title === "Adjectives", );
    //const rollTablePacks = game.packs.filter((e) => e.documentName === "RollTable", );

    this._rollTableList = [];

    // TODO - determine if this is necessary - probably not
    // if (game.tables.size > 0) {
    //   this._rollTableList["World"] = [];
    // }
    // for (const table of game.tables) {
    //   this._rollTableList["World"].push({
    //     name: table.name,
    //     uuid: `RollTable.${table.id}`,
    //   });
    // }

    for (const pack of rollTablePacks) {
      //this._rollTableList[pack.metadata.label] = [];
      let optGroup = pack.metadata.label;
      for (let table of pack.index) {
        //this._rollTableList[pack.metadata.label].push({
        this._rollTableList.push({
          name: table.name,
          uuid: table.uuid,
          group: optGroup
        });
      }
    }
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "Rollable Tables found", this._rollTableList,);
  }

  /**
   *
   * @param {section#actors.tab.sidebar-tab.directory.flexcol.actors-sidebar}  html
   *
   * @return {Promise<any>}
   */
  async _hookActorDirectory(html, options) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "_hookActorDirectory");
    // We should be using options.parts for this, but I'm not sure how
    const existingMenu = html.querySelector(".token-mold");
    if (existingMenu !== null)
    {
      return;
    }

    this.section = document.createElement("section");
    this.section.classList.add("token-mold");
    // Add menu before directory header
    const dirHeader = html.querySelector(".directory-header");
    dirHeader.parentNode.insertBefore(this.section, dirHeader);

    if (this.settings !== undefined) {
      this._renderActorDirectoryMenu(options);
    }
  }

  /**
   * What should this be?
   *
   * @returns {Promise<any>}
   */
  async _renderActorDirectoryMenu(options) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "_renderActorDirectoryMenu");
    const section = this.section;
    section.insertAdjacentHTML(
      "afterbegin",
      `
        <label class='label-inp' title='(De-)activate Name randomizing'>
            <input class='name rollable' type='checkbox' name='name.use' ${this.settings.name.use ? "checked" : ""}><span><span class='checkmark'></span>&nbsp;Name</span>
        </label>
        ${
          TokenConsts.SUPPORTED_ROLLHP.includes(game.system.id)
            ? `
        <label class='label-inp' title='(De-)activate Hit Point rolling'>
            <input class='hp rollable' type='checkbox' name='hp.use' ${this.settings.hp.use ? "checked" : ""}><span><span class='checkmark'></span>&nbsp;HP</span>
        </label>`
            : ``
        }
        <label class='label-inp' title='(De-)activate Token Config Overwrite'>
            <input class='config rollable' type='checkbox' name='config.use' ${this.settings.config.use ? "checked" : ""}><span><span class='checkmark'></span>&nbsp;Config</span>
        </label>
        <label class='label-inp' title='(De-)activate Stat Overlay On Hover'>
            <input class='config rollable' type='checkbox' name='overlay.use' ${this.settings.overlay.use ? "checked" : ""}><span><span class='checkmark'></span>&nbsp;Overlay</span>
        </label>

        <a class='refresh-selected' title="Reapplies all settings to selected tokens as if those were replaced onto the scene."><i class="fa-solid fa-rotate"></i></a>
        <a class='token-rand-form-btn' title='Settings'><i class="fa-solid fa-gear"></i></a>
      `,
    );

    const inputs = section.querySelectorAll('input[type="checkbox"]');
    for (let checkbox of inputs) {
      checkbox.addEventListener("change", (ev) => {
        foundry.utils.setProperty(this.settings, ev.target.name, ev.target.checked);
        this.saveSettings();
      });
    }

    this.section
      .querySelector(".refresh-selected")
      .addEventListener("click", (ev) => this._refreshSelected());
    this.section
      .querySelector(".token-rand-form-btn")
      .addEventListener("click", (ev) => {
        if (this.form === undefined) {
          this.form = new TokenMoldForm(this);
        } else {
          this.form.settings = this.settings;
        }
        this.form.render(true);
      });
  }

  /**
   * Always update all checkboxes present. For two reasons:
   *  - Other connected user  changes smth, so we have to update our view as well
   *  - Popout sidebar needs to update on change as well
   *
   * @returns {void}
   * @private
   */
  #updateCheckboxes() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#updateCheckboxes");
    const inputs = document.querySelectorAll("section.token-mold input");
    inputs.forEach((el) => {
      const name = el.name;
      el.checked = foundry.utils.getProperty(this.settings, name);
    });
  }

  /**
   *
   * @param {Scene}   scene
   * @param {object}  tokenData
   *
   * @return {object}
   * @private
   */
  #setTokenData(scene, tokenData) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#setTokenData");
    const actor = game.actors.get(tokenData.actorId);
    const newData = { _id: tokenData._id };

    if (!actor || (tokenData.actorLink && this.settings.unlinkedOnly)) {
      // Don't for linked token
      return newData;
    }

    // Do this for all tokens, even player created ones
    if (this.settings.size.use && TokenConsts.SUPPORTED_CREATURESIZE.includes(game.system.id)) {
      this.#setCreatureSize(newData, actor, scene);
    }

    if (this.counter[scene.id] === undefined) {
      this.counter[scene.id] = {};
    }

    if (this.settings.name.use) {
      const newName = this.#modifyName(tokenData, actor, scene);
      newData.name = newName;
    }

    if (this.settings.config.use) {
      this.#overwriteConfig(newData, actor);
    }

    return newData;
  }

  /**
   * What should this be?
   *
   * @param {TokenDocument} token
   *
   * @returns {Promise<any>}
   */
  async _setHP(token) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "_setHP");

    if (!token.actor || (token.actorLink && this.settings.unlinkedOnly)) {
      // Don't for linked token
      return;
    }

    if (TokenConsts.SUPPORTED_ROLLHP.includes(game.system.id)) {
      if (this.settings.hp.use) {
        const val = await this.#rollHP(token);
        token.actor.update({'system.attributes.hp': {value: val, max: val}});
      }
    }
  }

  /**
   * What should this be?
   *
   * @returns {Promise<Document[]>}
   */
  async _refreshSelected() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "_refreshSelected");
    const selected = canvas.tokens.controlled;
    let udata = [];
    for (const token of selected) {
      const newData = this.#setTokenData(canvas.scene, token.document.toObject());

      await this._setHP(token.document);

      udata.push(newData);
    }

    canvas.scene.updateEmbeddedDocuments("Token", udata);
  }

  /**
   * displayBars.use
   * displayBars.value
   * bar1.use
   * bar1.attribute
   * bar2.use
   * bar2.attribute
   * displayName.use
   * displayName.value
   * disposition.use
   * disposition.value
   * vision.use  -- (internal)
   * vision.value  -- now sight.enbled
   * scale.use  -- (internal)
   * scale.min  -- now texture.scaleX and  texture.scaleY
   * scale.max  -- now texture.scaleX and  texture.scaleY
   * rotation.use
   * rotation.min
   * rotation.max
   * mirrorX.use  -- now texture.scaleX
   * mirrorY.use  -- now texture.scaleY
   *
   * @param {TokenData} tokenData
   * @param {Actor}     actor  // not needed?
   *
   * @returns {void}
   * @private
   */
  #overwriteConfig(tokenData, actor) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#overwriteConfig");
    for (let [key, value] of Object.entries(this.settings.config)) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "Key: ", key, "; Value: ", value);
      if (value.use !== true) {
        continue;
      }
      switch(key)
      {
        case "displayBars":
          tokenData[key] = value.value;
          break;
        case "displayName":
          tokenData[key] = value.value;
          break;
        case "disposition":
          tokenData[key] = value.value;
          break;
        case "vision":
          tokenData["sight.enabled"] = value.value;
          break;
        case "bar1": // works -- sort of
          //if (value.attribute === "" || foundry.utils.getProperty(actor, value.attribute) !== undefined) // ??
          tokenData["bar1.attribute"] = value.attribute;
          break;
        case "bar2": // works -- sort of
          //if (value.attribute === "" || foundry.utils.getProperty(actor, value.attribute) !== undefined) // ??
          tokenData["bar2.attribute"] = value.attribute;
          break;
        case "scale":
          let scaleX = tokenData["texture.scaleX"] || 1;
          let scaleY = tokenData["texture.scaleY"] || 1;
          let scale = Math.floor((Math.random() * (value.max - value.min) + value.min) * 100, );
          tokenData["texture.scaleX"] = (scaleX * scale) / 100;
          tokenData["texture.scaleY"] = (scaleY * scale) / 100;
          break;
        case "rotation":
          let rot = tokenData[key] || 1;
          tokenData[key] = (rot * Math.floor((Math.random() * (value.max - value.min) + value.min) * 100, )) / 100;
          break;
        case "mirrorX":
          let mirrorX = Boolean(Math.round(Math.random()));
          if (mirrorX)
          {
            let scaleX = tokenData["texture.scaleX"] || 1;
            tokenData["texture.scaleX"] = -1 * scaleX;
          }
          break;
        case "mirrorY":
          let mirrorY = Boolean(Math.round(Math.random()));
          if (mirrorY)
          {
            let scaleY = tokenData["texture.scaleY"] || 1;
            tokenData["texture.scaleY"] = -1 * scaleY;
          }
          break;
        default:
          TokenLog.log(TokenLog.LOG_LEVEL.Error, "#overwriteConfig: Key: '", key, "' does not exist.");
          break;
      }
    }
  }

  /**
   *
   * @param {TokenDocument} token
   *
   * @returns {Promise<any>}
   * @private
   */
  async #rollHP(token) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#rollHP");
    const hpProperties = {
      dnd5e: "system.attributes.hp.formula",
      sw5e: "system.attributes.hp.formula",
      dcc: "system.attributes.hitDice.value",
    };

    const formula = foundry.utils.getProperty(token.actor, hpProperties[game.system.id]);
    if (formula) {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#rollHP.formula", formula );

      const constant = new Roll(formula.replace(" ", ""));
      constant.evaluateSync({strict: false}); // calculate the constant portion
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#rollHP.constant.evaluateSync.total", constant.total );

      const roll = new Roll(formula.replace(" ", ""));
      await roll.evaluate();
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#rollHP.roll.evaluate.total", roll.total );

      if (this.settings.hp.toChat) {
        roll.toMessage({
          rollMode: "gmroll",
          flavor: token.name + " rolls for hp!",
        });
      }
      // Make sure hp is at least 1 or the number of dice + constant value
      const min = Math.max(roll.dice[0].number + constant.total, 1);
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#rollHP.min", min );
      const val = Math.max(roll.total, min);

      return val;
    } else {
      ui.notifications.warn("Can not randomize hp. HP formula is not set.");
      return foundry.utils.getProperty(token.actor, "system.attributes.hp.value");
    }
  }

  /**
   *
   * @param {TokenData} tokenData
   * @param {Actor}     actor
   * @param {Scene}     scene
   *
   * @return {void}
   */
  #modifyName(tokenData, actor, scene) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#modifyName");
    // This would allow other modules/systems to modify the name and still get the prefix/suffix.
    // Except on 'refresh' it keeps adding additional prefix/suffix.
    //let name = tokenData.name;
    let name = actor.prototypeToken.name;

    // Temporarily removing baseNameOverride as shift-drag doesn't seem to work anymore
    //if (["remove", "replace"].includes(this.settings.name.replace) && !(this.settings.name.baseNameOverride && getModifierState("Shift"))) {
    if (["remove", "replace"].includes(this.settings.name.replace)) {
      name = "";
    }

    let numberSuffix = "";
    if (this.settings.name.number.use) {
      let number = 0;
      // Check if number in session database
      if (this.counter[scene.id][tokenData.actorId] !== undefined) {
        number = this.counter[scene.id][tokenData.actorId];
      } else {
        // Extract number from last created token with the same actor ID
        const sameTokens =
          scene.tokens.filter((e) => e.actorId === tokenData.actorId) || [];
        if (sameTokens.length !== 0) {
          const lastTokenName = sameTokens[sameTokens.length - 1].name;
          // Split by prefix and take last element
          let tmp = lastTokenName.split(this.settings.name.number.prefix).pop();
          if (tmp !== "") {
            // Split by suffix and take first element
            number = tmp.split(this.settings.name.number.suffix)[0];
          }
        }
      }
      // Convert String back to number
      switch (this.settings.name.number.type) {
        case "ar":
          number = parseInt(number);
          break;
        case "alu":
          number = this.#dealphabetize(number.toString(), "upper");
          break;
        case "all":
          number = this.#dealphabetize(number.toString(), "lower");
          break;
        case "ro":
          number = this.#deromanize(number);
          break;
      }
      // If result is no number, set to zero
      if (isNaN(number)) {
        number = 0;
      } else {
        // count upwards
        if (this.settings.name.number.range > 1) {
          number += Math.ceil(Math.random() * this.settings.name.number.range);
        } else {
          number++;
        }
      }

      switch (this.settings.name.number.type) {
        case "alu":
          number = this.#alphabetize(number, "upper");
          break;
        case "all":
          number = this.#alphabetize(number, "lower");
          break;
        case "ro":
          number = this.#romanize(number);
          break;
      }

      this.counter[scene.id][tokenData.actorId] = number;

      numberSuffix =
        this.settings.name.number.prefix + number + this.settings.name.number.suffix;
    }

    if (this.settings.name.replace === "replace") {
      name = this.pickNewName(actor) + " " + name;
    }

    if (this.settings.name.prefix.use) {
      const adj =
        this.adjectives.results._source[
          Math.floor(this.adjectives.results.size * Math.random())
        ].description;
      if (this.settings.name.prefix.position === "back") {
        name = name + " " + adj;
      } else {
        name = adj + " " + name;
      }
    }

    name += numberSuffix;

    return name;
  }

  /**
   *
   * @param {object} items
   *
   * @returns {string}
   * @private
   */
  #chooseWeighted(items) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#chooseWeighted");
    var keys = Object.keys(items);
    var vals = Object.values(items);
    var sum = vals.reduce((accum, elem) => accum + elem, 0);
    var accum = 0;
    vals = vals.map((elem) => (accum = elem + accum));
    var rand = Math.random() * sum;
    return keys[vals.filter((elem) => elem <= rand).length];
  }

  /**
   *
   * @param {string} txt
   * @param {string} fromCase
   * @param {string} toCase
   *
   * @returns {string}
   * @private
   */
  #changeCase(txt, fromCase, toCase) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#changeCase");
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
   *
   * @param {Actor} actor
   *
   * @return {string}
   * @public
   */
  pickNewName(actor) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "pickNewName");
    const attributes = this.settings.name.options.attributes || [];

    let lang;
    for (let attribute of attributes) {
      const langs = attribute.languages;
      const val = String(foundry.utils.getProperty(actor.system, attribute.attribute), ).toLowerCase();

      lang = langs[val];

      if (lang !== undefined) {
        break;
      }
    }

    if (lang === undefined) {
      lang = this.settings.name.options.default;
    }

    if (lang === "random") {
      const keys = Object.keys(this.dict);
      lang = keys[Math.floor(Math.random() * keys.length)];
    }

    const minNameLen = this.settings.name.options.min || 6;
    const maxNameLen = this.settings.name.options.max || 9;

    const nameLength =
      Math.floor(Math.random() * (maxNameLen - minNameLen + 1)) + minNameLen;
    let newName = this.#chooseWeighted(this.dict[lang].beg);
    const ltrs = (x, y, b) =>
      x in b && y in b[x] && Object.keys(b[x][y]).length > 0 ? b[x][y] : false;

    for (let i = 4; i <= nameLength; i++) {
      const c1 = newName.slice(-2, -1);
      const c2 = newName.slice(-1);
      const br = i == nameLength ? this.dict[lang].end : this.dict[lang].mid;
      const c3 = ltrs(c1, c2, br) || ltrs(c1, c2, this.dict[lang].all) || {};
      if (c1 == c2 && c1 in c3) {
        delete c3[c1];
      }
      if (Object.keys(c3).length == 0) {
        break;
      }
      newName = newName + this.#chooseWeighted(c3);
    }

    newName = newName[0] + this.#changeCase(newName.slice(1), this.dict[lang].upper, this.dict[lang].lower, );
    return newName;
  }

  /**
   *
   * @param {string} num
   * @param {string} letterStyle
   *
   * @return {number}
   * @private
   */
  #dealphabetize(num, letterStyle) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#dealphabetize");
    if (num === "0") {
      return 0;
    }
    let ret = 0;
    const startValue = {
      upper: 64,
      lower: 96,
    }[letterStyle];

    for (const char of num) {
      ret += char.charCodeAt(0) - startValue;
    }

    return ret;
  }

  /**
   *
   * @param {number} num
   * @param {string} letterStyle
   *
   * @return {string}
   * @private
   */
  #alphabetize(num, letterStyle) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#alphabetize");
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

  /**
   * Romanizes a number, code is from : http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
   *
   * @param {number} num
   *
   * @return {string}
   * @private
   */
  #romanize(num) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#romanize");
    if (!+num) {
      return false;
    }
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
    while (i--) {
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
  }

  /**
   * code is from : http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
   *
   * @param {string} rom
   *
   * @return {number}
   * @private
   */
  #deromanize(rom) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#deromanize");
    if (typeof rom !== "string") {
      return 0;
    }
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
    if (!(str && validator.test(str))) {
      return false;
    }
    while ((m = token.exec(str))) {
      num += key[m[0]];
    }
    return num;
  }


  /**
   * Scale tokens according to set creature size
   * DnD 5e and PF2e only
   *
   * @param {object}    newData
   * @param {Actor}     actor
   * @param {Scene}     scene
   *
   * @return {void}
   * @private
   */
  #setCreatureSize(newData, actor, scene) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#setCreatureSize");
    const sizes = {
      tiny: 0.5,
      sm: 0.8,
      med: 1,
      lg: 2,
      huge: 3,
      grg: 4,
    };
    const aSize = actor.system.traits.size;
    let tSize = sizes[aSize];

    // if size could not be found return
    if (tSize === undefined) {
      return;
    }

    // If scene has feet/ft as unit, scale accordingly
    //  5 ft => normal size
    // 10 ft => double
    // etc.
    if (scene.grid.type && /(ft)|eet/.exec(scene.grid.units) !== null) {
      tSize *= 5 / scene.grid.distance;
    }

    if (tSize < 1) {
      newData["texture.scaleX"] = newData["texture.scaleY"] =
        tSize < 0.2 ? 0.2 : Math.floor(tSize * 10) / 10;
      newData["width"] = newData["height"] = 1;
    } else {
      const int = Math.floor(tSize);

      // Make sure to only have integers
      newData["width"] = newData["height"] = int;
      // And scale accordingly
      tSize = Math.max(tSize / int, 0.2);
      newData["texture.scaleX"] = newData["texture.scaleY"] = tSize;
    }
  }

  /**
   *
   * @return {void}
   * @private
   */
  #registerSettings() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#registerSettings");
    // register settings
    game.settings.register("Token-Mold", "everyone", {
      name: "Token Mold Settings",
      hint: "Settings definitions for the Token Mold Module",
      default: this.#defaultSettings(),
      type: Object,
      scope: "world",
      onChange: (data) => {
        this.settings = data;
        this.#updateCheckboxes();
      },
    });
  }

  /**
   *
   * @return {object}
   * @private
   */
  #defaultSettings() {
    TokenLog.log(TokenLog.LOG_LEVEL.Info, "Loading #defaultSettings");
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
          table: "Compendium.token-mold.adjectives.RollTable.BGNM2VPUyFfA5ZMJ", // English
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
          attribute: "",
        },
        bar2: {
          use: false,
          attribute: "",
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
        attrs: this.#defaultAttrs,
      },
    };
  }

    /**
     *
     * @return {object[]}
     * @private
     */
    get #defaultAttrs() {
      TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#defaultAttrs");
      if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
        return [
          {
            icon: '&#xf06e;', // <i class="fa-solid fa-eye"></i>
            path: 'system.skills.prc.passive',
          },
          {
            icon: '&#xf3ed;', // <i class="fa-solid fa-shield-halved"></i>
            path: 'system.attributes.ac.value',
          },
        ];
      } else {
        return [];
      }
    }

  /**
   *
   * @return {void}
   * @private
   */
  #loadSettings() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#loadSettings");
    this.settings = game.settings.get("Token-Mold", "everyone");
    // Check for old data
    if (!this.settings) {
      this.settings = this.#defaultSettings();
    }
    if (this.settings.config.data !== undefined) {
      for (let [key, value] of Object.entries(this.settings.config.data)) {
        this.settings.config[key] = {
          use: true,
          value: value,
        };
      }
      delete this.settings.config.data;
    }
    if (foundry.utils.getProperty(this.settings, "overlay.attrs") && this.settings.overlay.attrs.length === 0) {
      delete this.settings.overlay.attrs;
    }
    if (foundry.utils.getProperty(this.settings, "name.options.attributes") && this.settings.name.options.attributes.length === 0) {
      delete this.settings.name.options.attributes;
    }
    this.settings = foundry.utils.mergeObject(this.#defaultSettings(), this.settings);

    if (TokenConsts.SUPPORTED_5ESKILLS.includes(game.system.id)) {
      if (this.settings.name.options === undefined) {
        const dndOptions = this.dndDefaultNameOptions;
        this.settings.name.options.default = dndOptions.default;
        this.settings.name.options.attributes = dndOptions.attributes;
      }
    }
    this.#loadDicts();
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "Loading Settings", this.settings, );
  }

  /**
   *
   * @return {object}
   * @public
   */
  get dndDefaultNameOptions() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "dndDefaultNameOptions");
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
        //     attribute: "system.details.race",
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
          attribute: "system.details.type",
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

  /**
   *
   * @return {Promise<>}
   * @public
   */
  async saveSettings() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "saveSettings", this.settings);
    if (!this.adjectives || this.adjectives.uuid !== this.settings.name.prefix.table) {
      this.#loadTable();
    }

    if (this.settings.name.replace === "remove" && !this.settings.name.number.use && !this.settings.name.prefix.use) {
      this.settings.name.replace = "nothing";
      TokenLog.log(TokenLog.LOG_LEVEL.Warn, game.i18n.localize("tmold.warn.removeName"), );
      ui.notifications.warn(game.i18n.localize("tmold.warn.removeName"));
    }

    await game.settings.set("Token-Mold", "everyone", this.settings);
    this.#loadDicts();
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "Saving Settings", this.settings, );
  }

  /**
   *
   * @return {Promise<object>}
   * @private
   */
  async #getBarAttributes() {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "#getBarAttributes");
    // const types = CONFIG.Actor.documentClass.TYPES.filter(x => x !== 'base');
    let barData = []; //{ bar: {}, value: {} };
    // let addElement = (obj, key, val) => {
    //   if (obj[key]) obj[key] += ", " + val;
    //   else obj[key] = val;
    // };
    // for (const type of types) {
      try {
        // const docClass = new CONFIG.Actor.documentClass({
        //   type: type,
        //   name: type + "_tmp",
        // }).system;
        // const { bar, value } =
        //   CONFIG.Token.documentClass.getTrackedAttributes(docClass);
        // for (const val of bar) {
        //   addElement(barData.bar, val.join("."), type);
        // }
        // for (const val of value) {
        //   addElement(barData.value, val.join("."), type);
        // }

        // new?? from mixin.mjs async _prepareResourcesTab()
        //const usesTrackableAttributes = !foundry.utils.isEmpty(CONFIG.Actor.trackableAttributes);
        //const attributeSource = (this.actor?.system instanceof foundry.abstract.DataModel) && usesTrackableAttributes
        //  ? this.actor?.type
        //  : this.actor?.system;
        //const attributeSource = type;
        const TokenDocument = foundry.utils.getDocumentClass("Token");
        const attributes = TokenDocument.getTrackedAttributes();

        const typeData = TokenDocument.getTrackedAttributeChoices(attributes);
        barData = typeData;
      } catch (e) {
        TokenLog.log(TokenLog.LOG_LEVEL.Debug, "Error navigating document class type!", type, e, );
      }
    // }
    return barData;
  }
}
