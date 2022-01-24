import TokenMold from "./token-mold.js";

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(TokenMold.MODULEID);
});

Hooks.on("init", () => {
  game["token-mold"] = new TokenMold();
});

// import Mold from './mold.js';
// import MoldConfig from './settings.js';

// Hooks.on('setup', () => {
//   Mold.init();
// 	MoldConfig.init();
// });
