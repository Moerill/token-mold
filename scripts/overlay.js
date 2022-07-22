export class TokenMoldOverlay extends BasePlaceableHUD {
	static FOUNDRY_VERSION = 0;

	static get defaultOptions() {
		TokenMoldOverlay.FOUNDRY_VERSION = game.version ?? game.data.version;

		const options = super.defaultOptions;
		options.classes = options.classes.concat(["token-mold-overlay"]);
		options.template = "modules/token-mold/templates/overlay.html";
		options.id = "token-mold-overlay";
		return options;
	}

	getData() {
		const data = super.getData();
		// get properties and filter if property was not found
		data.stats = this.attrs.map(e => {
			const ret =  {
				icon: e.icon,
				path: e.path,
				value: TokenMoldOverlay.FOUNDRY_VERSION >= 10 ? getProperty(this.object.actor, e.path) : getProperty(this.object.actor.data, e.path)
			};
			if (ret.value === ""  || ret.value === null || ret.value === undefined)
				return null;
			return ret;
		}).filter(e => e !== null);
		return data;
	}

	setPosition() {
		if (!this.object) return;

	  const position = {
	    width: this.object.w,
      height: this.object.h,
      left: this.object.x,
			top: this.object.y,
			"font-size": canvas.grid.size / 5 + "px"
    };
		this.element.css(position);
  }
}
