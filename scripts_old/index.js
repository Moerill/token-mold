import TokenMold from "./token-mold.js";

Hooks.on("init", () => {
  game["token-mold"] = new TokenMold();
});

// import Mold from './mold.js';
// import MoldConfig from './settings.js';

// Hooks.on('setup', () => {
//   Mold.init();
// 	MoldConfig.init();
// });
