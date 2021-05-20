export default class ConfigMold {
  static get defaultSettings() {
    return {
			active: false,
				bar1: {
					active: false,
					type: "String"
				},
				bar2: {
						active: false,
						type: "String"
				},
				displayName: {
						active:  false,
						value: 40,
						type: "Number"
				},
				displayBars: {
						active: false,
						value: 40,
						type: "Number"
				},
				disposition: {
						active: false,
						value: 0,
						type: "Number"
				},
				rotation: {
						active: false,
						min: 0,
						max: 360,
						type: "Range"
				},
				lockRotation: {
					active: false,
					type: "Boolean"
				},
				scale: {
						active: false,
						min: 0.8,
						max: 1.2,
						type: "Range"
				},
				vision: {
						active: false,
						value: true,
						type: "Boolean"
				},
		};
	}

	static get settings() {
		return mergeObject(this.defaultSettings, game.settings.get('token-mold', 'config'));
	}
}