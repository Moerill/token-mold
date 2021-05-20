import { BaseAttributeMold } from "./base.js";

export default class AttributeByRollMold extends BaseAttributeMold {
  static title() {
    return game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.titles.ByRollMold"
    );
  }

  static render(data = {}) {
    return `${super.render(
      data
    )}<input type="text" placeholder="Roll Formula" ${
      data.formula ? `value="${data.formula}"` : ""
    }> `;
  }
}
