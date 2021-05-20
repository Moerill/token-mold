import BaseMold from "./base.js";
import { log } from "../util.js";

let compendiumList = null;

export default class RandomItemMold extends BaseMold {
  static title() {
    return game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.titles.RandomItemMold"
    );
  }

  static render({ uuid } = {}) {
    if (!compendiumList)
      compendiumList = game.packs.filter((e) => e.entity === "Item");
    return `<select>
			${compendiumList.map(
        (e) =>
          `<option value="${e.collection}" ${
            uuid === e.collection ? "selected" : ""
          }>${e.title} (${e.metadata.package})`
      )}
		</select>`;
  }
}
