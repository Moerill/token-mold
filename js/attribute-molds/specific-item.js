import BaseMold from "./base.js";
import { log } from "../util.js";

export default class SpecificItemMold extends BaseMold {
  static title() {
    return game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.titles.SpecificItemMold"
    );
  }

  static render({ uuid, name } = {}) {
    return `<div class='dropzone' data-uuid="${uuid}" title="${game.i18n.localize(
      "TOKEN-MOLD.settings.attributes.dblClickToDisplay"
    )}">${
      name
        ? name
        : game.i18n.localize("TOKEN-MOLD.settings.attributes.dropItemHere")
    }</div>`;
  }

  static activateListeners(html) {
    html.addEventListener(
      "dragenter",
      (ev) => {
        const target = ev.target.closest(".dropzone");
        if (!target) return;
        target.classList.add("over");
        console.log(ev);
      },
      true
    );
    html.addEventListener(
      "dragleave",
      (ev) => {
        const target = ev.target.closest(".dropzone");
        if (!target) return;
        target.classList.remove("over");
      },
      true
    );
    html.addEventListener("drop", async (ev) => {
      const target = ev.target.closest(".dropzone");
      if (!target) return;
      ev.stopPropagation();
      ev.preventDefault();
      let data;
      try {
        data = JSON.parse(ev.dataTransfer.getData("text/plain"));
      } catch (e) {
        return;
      }
      if (data.type !== "Item") {
        ui.notifications.error("Dropped element bust be an item!");
        return;
      }
      if (data.actorId) {
        ui.notifications.error("Dropped item must not belong to an actor!");
        return;
      }
      const uuid = data.pack
        ? "Compendium." + data.pack + "." + data.id
        : "Item." + data.id;
      target.dataset.uuid = uuid;
      const item = await fromUuid(uuid);
      target.innerText = item.name;

      target.classList.remove("over");
    });

    html.addEventListener("dblclick", (ev) => {
      const target = ev.target.closest(".dropzone");
      if (!target) return;
      ev.stopPropagation();
      ev.preventDefault();
      fromUuid(target.dataset.uuid).then((item) => item.sheet.render(true));
    });
  }
}
