import Test from "./test.svelte";
import { writable } from "svelte/store";

class SvelteApp extends FormApplication {
	static get defaultOptions() {
		let options = super.defaultOptions;
		options.width = 800;
		options.height = 800;
		options.resizable = true;
		options.tabs = [
			{
				navSelector: ".tabs",
				contentSelector: "form",
				initial: "general",
			},
		];
		options.closeOnSubmit = false;
		options.submitOnChange = false;
		return options;
	}
	async _renderInner(data) {
		let html = $('<form></form autocomplete="off">');

		if (!this._svelte) {
			await new Promise((resolve, reject) => {
				let rendered = writable(0);
				this.datastore = writable({ title: "asd" });
				rendered.subscribe((value) => {
					console.log("subscribed!", value);
					if (value === 1) resolve();
				});
				this._svelte = new Test({
					target: html[0],
					props: {
						rendered,
						datastore: this.datastore,
					},
				});
			});
		}
		console.log("svelte obj", this._svelte);
		//this._svelte.$on("onMount", (ev) => {
		//console.log("asdasd", ev);
		//});
		this.form =
			html[0] instanceof HTMLFormElement ? html[0] : html.find("form")[0];
		return html;
	}

	// _render umschreiben..
	// ActivateListeners und activateCoredingens an die svelte  app übergeben probieren und dann onMount oder so aktivieren? :thinking:

	activateListeners(html) {
		console.log(html);
		super.activateListeners(html);
		html.find("input").on("change", (ev) => console.log("bla"));
	}

	async _render(...args) {
		if (this._svelte) return;
		await super._render(args);
		console.log("this element", this, this._element);
	}

	async _onSubmit(...args) {
		console.log("!submit", ...args);
		super._onSubmit(...args);
	}

	async _updateObject(ev, data) {
		console.log("update object!", ev, data);
		this.datastore.set(data);
		this.render();
	}

	//_replaceHTML() {
	//return;
	//}

	//_injectHTML(html) {
	//super._injectHTML(html);
	//new Test({
	//target: this._element[0].querySelector(".window-content"),
	//});
	//}
}

Hooks.on("ready", async () => {
	const app = new SvelteApp();
	await app.render(true);
	console.log(app);
});
