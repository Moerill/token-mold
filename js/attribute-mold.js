import { log, randomIDCheckbox } from "./util.js";
import {
  AttributeByRollMold,
  AttributeByStringMold,
  AttributeByRollabletableMold,
  RandomItemMold,
  SpecificItemMold,
} from "./attribute-molds/index.js";

const molds = {
  AttributeByRollMold,
  AttributeByStringMold,
  AttributeByRollabletableMold,
  RandomItemMold,
  SpecificItemMold,
};

export default class AttributeMold {
  constructor(data = {}) {
    this.data = data;
  }

  get defaultData() {
    return {
      name: "",
      default: [],
      changes: [
        {
          attribute: {
            path: "",
            type: "equals",
            value: "",
          },
          stopping: false,
          changes: [],
        },
      ],
    };
  }

  static create() {
    return new AttributeMold({
      name: game.i18n.format("TOKEN-MOLD.settings.utility.newElement", {
        element: game.i18n.localize("TOKEN-MOLD.settings.utility.mold"),
      }),
      default: {
        type: "",
      },
      rows: [],
    });
  }

  static renderBase(molds = []) {
    return `
		<div class='attribute-molds'>
			<ol class='mold-list'>
				${molds.map((e) => AttributeMold.renderMoldlistRow(e)).join()}
				<li class='add-row'>${game.i18n.format(
          "TOKEN-MOLD.settings.utility.addElement",
          { element: game.i18n.localize("TOKEN-MOLD.settings.utility.mold") }
        )}</li>

			</ol>
			<ol class='settings-list'>
			</ol>
		</div>`;
    //<li class='config-item'>
    //<h4>Name:</h4><input type='text' value='${this.name}'>
    //${randomIDCheckbox("active?")}
    //</li>
    //<li class='config-item default-item'>
    //<h4>${game.i18n.localize("TOKEN-MOLD.settings.attributes.default")}</h4>
    //${this.renderChangebox()}
    //</li>
    //${this.renderConfigRow()}
    //${this.renderConfigRow()}
  }

  static renderMoldlistRow(data) {
    return `<li><h4>${data.name}</h4></li>`;
  }

  render(container) {
    container.innerHTML = this.renderList();
  }

  renderList() {
    return `<li class='config-item'>
					<h4>Name:</h4><input type='text' value='${this.data.name}'>
					${randomIDCheckbox("active?")}
				</li>
				<li class='config-item default-item'>
					<h4>${game.i18n.localize("TOKEN-MOLD.settings.attributes.default")}</h4>
					${this.renderChangebox()}
				</li>
				${this.renderConfigRow()}
				${this.renderConfigRow()}
				<li class='add-row'>${game.i18n.format(
          "TOKEN-MOLD.settings.utility.addElement",
          { element: game.i18n.localize("TOKEN-MOLD.settings.utility.row") }
        )}</li>`;
  }

  renderConfigRow(data) {
    return `
			<li class='config-item'>
				<div class='attribute-chooser'>
					<input class='attribute-selector' data-list='attribute-list' placeholder=${game.i18n.localize(
            "TOKEN-MOLD.settings.attributes.attribute"
          )}>
					<select>
						<option value="equals">${game.i18n.localize(
              "TOKEN-MOLD.settings.utility.equals"
            )}</option>
						<option value="unequals">${game.i18n.localize(
              "TOKEN-MOLD.settings.utility.unequals"
            )}</option>
						<option value="includes">${game.i18n.localize(
              "TOKEN-MOLD.settings.utility.includes"
            )}</option>
						<option value="nincludes">${game.i18n.localize(
              "TOKEN-MOLD.settings.utility.nincludes"
            )}</option>
					</select>
					<input type='text' class='attribute-value' placeholder="${game.i18n.localize(
            "TOKEN-MOLD.settings.attributes.value"
          )}">
				</div>
				<div class='stopping'>
					${randomIDCheckbox(
            game.i18n.localize("TOKEN-MOLD.settings.attributes.stopping")
          )}
				</div>
				${this.renderChangebox()}
			</li>`;
  }

  renderChangebox() {
    return `
				<div class='Changes'>
					<select class='change-selector'>
						<option value=""></option>
						<optgroup label="${game.i18n.localize(
              "TOKEN-MOLD.settings.attributes.titles.setAttribute"
            )}">
							<option value="AttributeByRollMold">${AttributeByRollMold.title()}</option>
							<option value="AttributeByStringMold">${AttributeByStringMold.title()}</option>
  						<option value="AttributeByRollabletableMold">${AttributeByRollabletableMold.title()}</option>
						</optgroup>
						<optgroup label="${game.i18n.localize(
              "TOKEN-MOLD.settings.attributes.titles.addItem"
            )}">
							<option value="RandomItemMold">${RandomItemMold.title()}</option>
							<option value="SpecificItemMold">${SpecificItemMold.title()}</option>
						</optgroup>
					</select>
					<div class='change-maker'>

					</div>
				</div>
				`;
  }

  save(container) {}

  static activateListeners(html, settings) {
    html.addEventListener("change", (ev) => {
      console.log(ev);
      const target = ev.target.closest(".change-selector");
      if (!target) return;
      log(target, target.nextElementSibling);

      target.nextElementSibling.innerHTML = molds[target.value]?.render() || "";
    });

    for (let mold in molds) {
      molds[mold].activateListeners(html);
    }

    html.addEventListener("click", (ev) => {
      const target = ev.target.closest(".add-row");
      if (!target) return;
      ev.preventDefault();
      ev.stopPropagation();

      if (target.closest(".mold-list")) {
        const mold = AttributeMold.create();
        log(["Creating attribute mold", mold, settings.data.attributeMolds]);
        settings.data.attributeMolds.push(mold);
        target.insertAdjacentHTML(
          "beforebegin",
          AttributeMold.renderMoldlistRow(mold.data)
        );
        $(target.previousElementSibling.children[0]).click();
      } else {
        const lastRow = target.previousElementSibling;
        lastRow.after(lastRow.cloneNode(true));
      }
    });

    html.addEventListener("click", (ev) => {
      const target = ev.target.closest(".mold-list li h4");
      if (!target) return;
      ev.preventDefault();
      ev.stopPropagation();

      const old = target.closest("ol").querySelector(".selected");
      const ol = target.closest("ol");
      const children = Array.from(ol.children);
      const configContainer = html.querySelector(
        ".attribute-molds .settings-list"
      );
      if (old) {
        old.classList.remove("selected");
        const idx = children.indexOf(old);

        settings.data.attributeMolds[idx].save(configContainer);
        log(settings.data.attributeMolds[idx]);
      }

      target.parentNode.classList.add("selected");
      const idx = children.indexOf(target.parentNode);
      log([idx, settings.data.attributeMolds]);
      settings.data.attributeMolds[idx].render(configContainer);
    });
  }

  _renderAttributeSelect(value) {
    const types = Object.keys(CONFIG.Actor.sheetClasses);
    let data = {};
    for (const type of types) {
      const actor = new CONFIG.Actor.documentClass({ name: "blub", type });
      const actorData = flattenObject(actor.data.data);
      for (const key in actorData)
        data[key] = data[key] ? [...data[key], type] : [type];
    }

    data.name = types;
    data.type = types;
    return `<ol class='datalist'>
			${Object.entries(data)
        .map(([key, value]) => {
          return `<li value="${key}"><span>${key}</span><span class='info'>${value.join(
            ", "
          )}</span></li>`;
        })
        .join("")}
		</ol>`;
    return `<datalist id="attributes">
			${Object.entries(data)
        .map(([key, value]) => {
          return `<option value="${key}">    [${value.join(", ")}]</option>`;
        })
        .join("")}
				</datalist>`;
  }
}
