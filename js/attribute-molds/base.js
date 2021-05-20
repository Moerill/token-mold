export default class BaseMold {
  static title() {
    return `This must be implemented by the derived class!`;
  }

  static activateListeners(html) {}

  static render(data) {
    return `<span>This must be implemented and overriden!</span>`;
  }

  static apply(tokenData, moldData) {
    console.error("Token Mold | This must be implemented by the child class.");
  }

  static saveData(div) {
    console.error("Token Mold | This must be implemented by the child class.");
  }
}

export class BaseAttributeMold extends BaseMold {
  static render(data = {}) {
    return `
					<input class='attribute-selector' data-list='attribute-list' placeholder=${game.i18n.localize(
            "TOKEN-MOLD.settings.attributes.attribute"
          )} ${data.attribute ? `value="${data.attribute}"` : ""}>
					`;
  }
}
