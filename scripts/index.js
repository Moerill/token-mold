import TokenMold from "./token-mold.js";

/*Enable Debug Module */
// NOTE: Developer Mode doesn't work in Foundry v12
// Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
//   registerPackageDebugFlag(TokenLog.MODULEID);
// });

Hooks.once("init", () => {
  game["token-mold"] = new TokenMold();
});
