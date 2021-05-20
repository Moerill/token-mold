import TokenMold from "./mold.js";
import SettingsMold from "./settings.js";

Hooks.on("ready", () => {
  SettingsMold.init();
  TokenMold.init();
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag("token-mold");
});
