import { AboutDialog } from "./about/about-dialog.mjs";
import { CONFIG } from "./config.mjs";
import { Logger } from "./logger/logger.mjs";
import { TokenMold } from "./token-mold.mjs";

Logger.MODULE_ID = AboutDialog.MODULE_ID = CONFIG.ID;

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CONFIG.ID);
});

Hooks.once("init", () => {TokenMold.initialize()});