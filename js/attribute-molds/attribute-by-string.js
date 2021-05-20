import { BaseAttributeMold } from "./base.js";

export default class AttributeByStringMold extends BaseAttributeMold {
  static title() {
    return game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.titles.ByStringMold"
    );
  }
}
