import { BaseAttributeMold } from "./base.js";
import { log } from "../util.js";

export default class AttributeByRollableTableMold extends BaseAttributeMold {
  static title() {
    return game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.titles.ByRollableTableMold"
    );
  }

  static render(data = {}) {
    return `${super.render(
      data
    )} <input class='list-selector rolltable-selector' data-list='rolltable-list' placeholder="${game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.chooseTable"
    )}" ${data.uuid ? `value="${data.uuid}"` : ""} title="${game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.dblClickToDisplay"
    )}">`;
  }

  static activateListeners(html) {
    html.addEventListener("dblclick", (ev) => {
      const target = ev.target.closest(".rolltable-selector");
      if (!target) return;

      ev.preventDefault();
      ev.stopPropagation();
      (async () => {
        try {
          const table = await fromUuid(target.value);

          log(table);
          if (!table) return;
          table?.sheet?.render(true);
        } catch (e) {}
      })();
    });
  }
}
