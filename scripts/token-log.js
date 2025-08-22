export default class TokenLog {
  // static MODULEID = "token-mold";
  static LOG_LEVEL = Object.freeze({
    Debug: 0,
    Info: 1,
    Warn: 2,
    Error: 3,
  });
  static CURRENT_LOG_LEVEL = TokenLog.LOG_LEVEL.Info;

  /**
   *
   * @param {object} level
   * @param  {...any} args
   *
   * @returns {void}
   */
  static log(level, ...args) {
    // NOTE: Developer Mode doesn't work in Foundry v12
    const shouldLog =
      level >= TokenLog.CURRENT_LOG_LEVEL;
      // || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(TokenLog.MODULEID);

    if (shouldLog) {
      switch (level) {
        case TokenLog.LOG_LEVEL.Error:
          console.error("Token Mold", "|", ...args);
          break;
        case TokenLog.LOG_LEVEL.Warn:
          console.warn("Token Mold", "|", ...args);
          break;
        case TokenLog.LOG_LEVEL.Info:
          console.info("Token Mold", "|", ...args);
          break;
        case TokenLog.LOG_LEVEL.Debug:
        default:
          console.debug("Token Mold", "|", ...args);
          break;
      }
    }
  }
}
