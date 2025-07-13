import  TokenLog  from "./token-log.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class TokenMoldOverlay extends HandlebarsApplicationMixin(foundry.applications.hud.BasePlaceableHUD) {

  // TODO Add a hook for renderTokenMoldOverlay ???
  // TODO Add a hook for closeTokenMoldOverlay ???

  /**
   * Applications are constructed by providing an object of configuration options.
   * @param {Partial<Configuration>} [options]    Options used to configure the Application instance
   */
  constructor(options) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldOverlay: constructor");
    super(options);
  }

  static DEFAULT_OPTIONS = {
    id: "token-mold-overlay",
    classes: ["token-mold-overlay"]
  };

  static PARTS = {
    HUD: {
      template: "modules/token-mold/templates/overlay.hbs"
    }
  };

  /**
   * Prepare application rendering context data for a given render request. If exactly one tab group is configured for
   * this application, it will be prepared automatically.
   * @param {RenderOptions} options                 Options which configure application rendering behavior
   * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
   * @protected
   * @override
   */
  async _prepareContext(options) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldOverlay: _prepareContext");
    const context = await super._prepareContext(options);
    // get properties and filter if property was not found
    context.stats = this.attrs
      .map((e) => {
        const ret = {
          icon: e.icon,
          path: e.path,
          value: foundry.utils.getProperty(this.object.actor, e.path),
        };
        if (!ret.value) { return null; }
        return ret;
      })
      .filter((e) => e !== null);
    return context;
  }

  /**
   * Translate a requested application position updated into a resolved allowed position for the Application.
   * Subclasses may override this method to implement more advanced positioning behavior.
   * @param {ApplicationPosition} position        Requested Application positioning data
   * @returns {ApplicationPosition}               Resolved Application positioning data
   * @protected
   * @override
   */
  _updatePosition(position) {
    TokenLog.log(TokenLog.LOG_LEVEL.Debug, "TokenMoldOverlay: _updatePosition");
    if (!this.object) { return; }

    // mxzf @ module-development
    // Well, the thing you run into is that you're either needing
    //  to account for canvas zoom (and the zoom level's what's really
    //  important) or you're not tying stuff to the canvas and
    //  zooming (in which case you can just set a fixed size that
    //  makes it legible)

    this.element.style.setProperty('font-size', canvas.grid.size / 5 + "px");

    let {width, height, left, top, scale} = position;
    scale ??= 1.0;

    return {width: this.object.w, height: this.object.h, left: this.object.x, top: this.object.y, scale: scale};
  }
}
