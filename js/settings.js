import ConfigMold from "./config-mold.js";
import AttributeMold from "./attribute-mold.js";
import { log } from "./util.js";

let rolltableList = "";

export default class SettingsMold extends FormApplication {
  constructor(...args) {
    super(...args);

    this.data = SettingsMold.settings;
  }
  static init() {
    game.settings.registerMenu("token-mold", "settings", {
      name: game.i18n.localize(""),
      label: game.i18n.localize("TOKEN-MOLD.settings.description"),
      icon: "fas fa-mug-hot",
      type: SettingsMold,
      restricted: true,
    });
    game.settings.register("token-mold", "settings", {
      type: Object,
      default: {},
    });

    SettingsMold._getRolltables().then(() => {
      const cls = game.settings.menus.get("token-mold.settings").type;
      new cls().render(true);
    });
  }

  static async _getRolltables() {
    const rollTablePacks = game.packs.filter((e) => e.entity === "RollTable");

    let _rollTableList = {};
    if (game.tables.size > 0) _rollTableList["World"] = [];
    for (const table of game.tables) {
      _rollTableList["World"].push({
        name: table.name,
        uuid: `RollTable.${table.id}`,
      });
    }
    for (const pack of rollTablePacks) {
      const idx = await pack.getIndex();
      _rollTableList[pack.metadata.label] = [];
      const tableString = `Compendium.${pack.collection}.`;
      for (let table of idx) {
        _rollTableList[pack.metadata.label].push({
          name: table.name,
          uuid: tableString + table._id,
        });
      }
    }
    rolltableList = `<ol class='datalist' id='rolltable-list' hidden>
			${Object.entries(_rollTableList)
        .map(
          ([scope, elements]) => `<li class='optgroup'>
				<!--<input type='checkbox' id='rolltable-list.${scope}'>-->
				<label for='rolltable-list.${scope}'>${scope}</label>
				<ol>
					${elements
            .map(
              (e) =>
                `<li data-class='value' data-value='${e.uuid}'><span class='name'>${e.name}</span></li>`
            )
            .join("")}
				</ol>
			</li>`
        )
        .join("")}
		</ol>`;
  }

  _getAttributeList() {
    const types = Object.keys(CONFIG.Actor.sheetClasses);
    let data = {};
    data.name = types;
    data.type = types;
    for (const type of types) {
      const actor = new CONFIG.Actor.documentClass({ name: "blub", type });
      const actorData = flattenObject(actor.data.data);
      for (const key in actorData)
        data[key] = data[key] ? [...data[key], type] : [type];
    }

    return `<ol class='datalist' id='attribute-list' hidden>
			${Object.entries(data)
        .map(([key, value]) => {
          return `<li data-value="${key}"><span>${key}</span><span class='info'>${value.join(
            ", "
          )}</span></li>`;
        })
        .join("")}
		</ol>`;
  }

  static get settings() {
    let settings = game.settings.get("token-mold", "settings");
    settings.config = ConfigMold.attributes; //mergeObject(ConfigMold.attributes, settings.config);
    if (!settings.attributeMolds) settings.attributeMolds = [];

    return settings;
  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: "modules/token-mold/templates/settings.hbs",
      title: "Token Mold Config - Customize your molds!",
      classes: ["token-mold", "settings"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: "form",
          initial: "general",
        },
      ],
      height: 800,
      width: 1000,
      submitOnClose: true,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html = html[0];
    let focusedElement = null;
    const filterList = (val, list) => {
      const els = list.querySelectorAll("li[data-value]");
      els.forEach((el) => {
        const data = Array.from(el.children)
          .map((span) => span.innerText)
          .join(" ")
          .toLowerCase();
        if (data.includes(val)) el.style.display = null;
        else el.style.display = "none";
      });
    };
    html.addEventListener(
      "focus",
      (ev) => {
        let target = ev.target.closest("input[data-list]");
        if (!target) return;
        focusedElement = target;
        ev.stopPropagation();
        ev.preventDefault();
        const list = html.querySelector(`#${target.dataset.list}`);
        list.hidden = false;
        const rect = target.getBoundingClientRect();
        list.style.top = rect.bottom + "px";
        list.style.left = rect.left + "px";
        const selected = list.querySelector(`li[data-value="${target.value}"]`);
        if (selected) {
          filterList("", list);
          selected.scrollIntoView();
        } else {
          filterList(target.value.toLowerCase(), list);
        }
      },
      true
    );

    html.addEventListener(
      "blur",
      (ev) => {
        html.querySelectorAll(".datalist").forEach((el) => {
          el.hidden = true;
        });
        focusedElement = null;
      },
      true
    );

    html.addEventListener("input", (ev) => {
      let target = ev.target.closest("input[data-list]");
      if (!target) return;
      const list = html.querySelector(`#${target.dataset.list}`);
      const val = target.value.toLowerCase();
      filterList(val, list);
    });

    html.addEventListener(
      "mousedown",
      (ev) => {
        const target = ev.target.closest("li[data-value]");
        if (!focusedElement || !target) return;

        focusedElement.value = target.dataset.value;
        focusedElement.blur();
      },
      true
    );

    AttributeMold.activateListeners(html, this);
  }

  getData() {
    let data = super.getData();
    data.settings = this.constructor.settings;
    data.settings.config = Object.entries(data.settings.config).map((el) =>
      this.renderElement(...el)
    );
    data.attributes = AttributeMold.renderBase(data.settings.attributes);
    data.lists = [rolltableList, this._getAttributeList()];
    log(["Settings get Data", data]);
    return data;
  }

  renderElement(key, value) {
    return `<li class='config-item'>
			<input name="config.${key}.use" type="checkbox" ${
      value.use ? "checked" : ""
    } id="token-mold.${key}"/>
			<label class="name" for="token-mold.${key}">${game.i18n.localize(
      "TOKEN-MOLD.settings.config." + key
    )}</label><div class="config-setting">${this["_render" + value.type](
      key,
      value
    )}</div>
		</li>`;
  }

  _renderBarData(key, value) {
    const types = CONFIG.Actor.documentClass.metadata.types;
    let barData = { bar: {}, value: {} };
    let addElement = (obj, key, val) => {
      if (obj[key]) obj[key] += ", " + val;
      else obj[key] = val;
    };
    for (const type of types) {
      const { bar, value } = TokenDocument.getTrackedAttributes(
        new CONFIG.Actor.documentClass({ type: "npc", name: "tmp" }).data.data
      );
      for (const val of bar) {
        addElement(barData.bar, val.join("."), type);
      }
      for (const val of value) {
        addElement(barData.value, val.join("."), type);
      }
    }
    return `<select name="config.${key}.value" data-dtype="String">
			<option value="">None</option>
			<optgroup label="${game.i18n.localize("TOKEN.BarAttributes")}">
				${Object.entries(barData.bar)
          .map(
            (e) =>
              `<option value="${e[0]}" ${
                e[0] == value.value ? 'selected="selected"' : ""
              }>${e[0]} [${e[1]}]</option>`
          )
          .join("")}
			</optgroup>
			<optgroup label="${game.i18n.localize("TOKEN.BarValues")}">
				${Object.entries(barData.value)
          .map(
            (e) =>
              `<option value="${e[0]}" ${
                e[0] == value.value ? 'selected="selected"' : ""
              }>${e[0]} [${e[1]}]</option>`
          )
          .join("")}
			</optgroup>
		</select>`;
  }

  _renderSelect(key, value) {
    return `<select name="config.${key}.value" data-dtype="Number">
			${Object.entries(value.data)
        .map(
          (e) =>
            `<option value="${e[0]}" ${
              value.value == e[0] ? 'selected="selected"' : ""
            }>${e[1]}</option>`
        )
        .join("")}
		</select>`;
  }

  _renderRandomNumber(key, value) {
    return `<span>${game.i18n.localize(
      "TOKEN-MOLD.settings.utility.min"
    )}</span>
			<input type="number" min="0" step="${
        value.step
      }" dtype="Number" name="config.${key}.min" value="${value.min}"/>
			<span>${game.i18n.localize("TOKEN-MOLD.settings.utility.max")}</span>
			<input type="number" min="0" step="${
        value.step
      }" dtypep="NUmber" name="config.${key}.max" value="${value.max}"/>`;
  }

  // Only important whether its chosen or not
  _renderBoolean(key, value) {
    return `<input id="token-mold.config.${key}.value" type="checkbox" name="config.${key}.value" ${
      value.value ? "checked" : ""
    }/>
		<label for="token-mold.config.${key}.value">${game.i18n.localize(
      "TOKEN-MOLD.settings.utility.active"
    )}</label>
		`;
  }

  // Only important whether its chosen or not
  _renderRandomBoolean(key, value) {
    return "";
  }

  // Same as RandomNumber. Only difference when applying it
  _renderRandomNumberMultiplier(key, value) {
    return this._renderRandomNumber(key, value);
  }

  async _updateObject(event, formData) {
    log(["Updating Settings..", formData]);
    game.settings.set("token-mold", "settings", expandObject(formData));
  }
}
