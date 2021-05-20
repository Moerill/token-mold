export default class NameMold {
  static get defaultSettings() {
    return {
			active: true,
			number: {
					active: true,
					prefix: " (",
					suffix: ")",
					type: "ar"
			},
			remove: false,
			prefix: {
					active: true,
					position: "front",
					table: 'Compendium.token-mold.adjectives.BGNM2VPUyFfA5ZMJ' // English
			},
			replace: "",
			options: {
					default: "random",
					attributes: [
							{
									attribute: "",
									languages: {
											"": "random"
									}
							}
					],
					min: 3,
					max: 9
			}
		};
	}
	
	static get settings() {
		return mergeObject(this.defaultSettings, game.settings.get('token-mold', 'name'));
	}
}