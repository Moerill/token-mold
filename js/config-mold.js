import { log } from "./util.js";

export default class ConfigMold {
  static get attributes() {
    let settings = ConfigMold.settings;

    settings.displayBars.data = Object.entries(
      CONST.TOKEN_DISPLAY_MODES
    ).reduce((obj, e) => {
      obj[e[1]] = game.i18n.localize(`TOKEN.DISPLAY_${e[0]}`);
      return obj;
    }, {});
    settings.displayName.data = Object.entries(
      CONST.TOKEN_DISPLAY_MODES
    ).reduce((obj, e) => {
      obj[e[1]] = game.i18n.localize(`TOKEN.DISPLAY_${e[0]}`);
      return obj;
    }, {});
    settings.disposition.data = Object.entries(CONST.TOKEN_DISPOSITIONS).reduce(
      (obj, e) => {
        obj[e[1]] = game.i18n.localize(`TOKEN.${e[0]}`);
        return obj;
      },
      {}
    );
    settings.scale.step = 0.1;
    return settings;
  }

  static get settings() {
    return mergeObject(
      {
        bar1: {
          use: false,
          type: "BarData",
        },
        bar2: {
          use: false,
          type: "BarData",
        },
        displayBars: {
          use: false,
          type: "Select",
        },
        displayName: {
          use: false,
          type: "Select",
        },
        disposition: {
          use: false,
          type: "Select",
        },
        lockRotation: {
          use: false,
          type: "Boolean",
        },
        rotation: {
          use: false,
          type: "RandomNumber",
          min: 0,
          max: 360,
          step: 1,
        },
        mirrorX: {
          use: false,
          type: "RandomBoolean",
        },
        mirrorY: {
          use: false,
          type: "RandomBoolean",
        },
        scale: {
          use: false,
          type: "RandomNumberMultiplier",
          min: 0.8,
          max: 1.2,
          step: 0.1,
        },
        vision: {
          use: false,
          type: "Boolean",
        },
      },
      game.settings.get("token-mold", "settings")?.config
    );
  }

  /**
   * Applies config overwritedata to the tokens
   * @param {*} tokenData
   */
  static applyMold(tokenData) {
    log(this.settings);
    const settings = Object.entries(this.settings).filter((e) => e[1].use);
    log(["Config Mold, original tokenData", duplicate(tokenData), settings]);
    for (const [key, value] of settings) {
      tokenData[key] = ConfigMold["_apply" + value.type](tokenData, key, value);
    }
    log(["Config Mold, modified tokenData", duplicate(tokenData), settings]);
  }

  static _applySelect(data, key, setting) {
    return setting.value;
  }

  static _applyRandomNumber(data, key, setting) {
    const num = Math.random() * (setting.max - setting.min) + setting.min;
    return num;
  }

  static _applyBoolean(data, key, setting) {
    return setting.value;
  }

  static _applyRandomBoolean(data, key, setting) {
    return Math.random() > 0.5;
  }

  static _applyRandomNumberMultiplier(data, key, setting) {
    return data * ConfigMold._applyRandomNumber(data, setting);
  }

  static _applyBarData(data, key, setting) {
    data[key].attribute = setting.value;
    log(data[key]);
    return data[key];
  }
}
