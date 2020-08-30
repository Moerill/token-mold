import TokenMold from './token-mold.js';

Hooks.on('init', () => {
	game["token-mold"] = new TokenMold();
});