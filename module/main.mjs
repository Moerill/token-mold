import { AboutDialog } from "./about/about-dialog.mjs";
import { CONFIG } from "./config.mjs";
import { Logger } from "./logger/logger.mjs";
import { TokenMold } from "./token-mold.mjs";

Logger.MODULE_ID = AboutDialog.MODULE_ID = CONFIG.ID;
CONFIG.TOKENMOLD = new TokenMold();

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CONFIG.ID);
});

Hooks.once("init", () => { CONFIG.TOKENMOLD.initialize(); });
Hooks.on("ready", () => { CONFIG.TOKENMOLD.onReady(); });

Hooks.on("renderActorDirectory", (app, html, data) => {
    if (game.user.isGM) CONFIG.TOKENMOLD.hookActorDirectory(html);
});