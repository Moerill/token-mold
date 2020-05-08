import TokenMold from './token-mold.js';

Hooks.on('init', () => {
	game["token-mold"] = new TokenMold();
});

Hooks.on('ready', async () => {
	// Only show welcome screen to gms
	if (!game.user.isGM)
		return;
	// Edit next line to match module.
	const module = game.modules.get("token-mold");
	const title = module.data.title;
	const moduleVersion = module.data.version;
	game.settings.register(title, 'version', {
		name: `${title} Version`,
		default: "0.0.0",
		type: String,
		scope: 'world',
	});
	const oldVersion = game.settings.get(title, "version");

	if (!isNewerVersion(moduleVersion, oldVersion))
		return;

	(await import(
								/* webpackChunkName: "welcome-screen" */
								'./welcome-screen.js'
								)
							).default();
})