/** 
 * Help Form 
 * Extends Foundry's FormApplication to provide a popup help context for the window.
 **/

 import { AboutDialog } from "./about-dialog.mjs";
 import { Logger } from "../logger/logger.mjs";
 
 export class HelpFormApplication extends FormApplication {
     static localizeHelp = null;
     static localizeAbout = null;
 
     #foundryVersion = 0;
     #enableAboutButton = false;
     #enableHelpButton = true;
     #wikiLink = null;
     #tutorialClass = null;
 
     constructor(object, options) { super(object, options);
         this.#foundryVersion = game.version ?? game.data.version;
         this.#enableAboutButton = object?.enableAboutButton ?? false;
         this.#enableHelpButton = object?.enableHelpButton ?? true;
         this.#wikiLink = object?.wikiLink ?? null;
         this.#tutorialClass = object?.tutorialClass ?? null;
     }
 
     _getHeaderButtons() {
         let buttons = super._getHeaderButtons();
 
         if (this.#enableHelpButton) {
             if (this.#wikiLink || (isNewerVersion(this.#foundryVersion, "10.0") && this.#tutorialClass)) {
                 buttons.unshift({
                     label: "",
                     class: "helpFormApplicationHelpButton",
                     title: game.i18n.localize(HelpFormApplication.localizeHelp),
                     icon: "fas fa-question",
                     onclick: () => { this._onHelpRequest(); }
                 });
             }
         }
 
         if (this.#enableAboutButton) {
             buttons.unshift({
                 label: "",
                 class: "helpFormApplicationAboutButton",
                 title: game.i18n.localize(HelpFormApplication.localizeAbout),
                 icon: "fas fa-info-circle",
                 onclick: () => { this._onAboutRequest(); }
             })
         }
 
         return buttons;
     }
 
     updateWikiLink(link) {
         this.#wikiLink = link;
     }
 
     _onAboutRequest() {
         let dialog = new AboutDialog();
         dialog.render(true);
     }
 
     _onHelpRequest() {
         if (isNewerVersion(this.#foundryVersion, "10.0")) {
             if (!this.#tutorialClass) {
                 window.open(this.#wikiLink, '_blank');
             } else {
                 Logger.debug("Load the tutorial!");
             }
         } else {
             window.open(this.#wikiLink, '_blank');
         }
     }
 }