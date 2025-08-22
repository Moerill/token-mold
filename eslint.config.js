import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  globalIgnores([
    "**/*.md",
    "**/LICENSE",
    "**/*.json",
    "scripts/dict/*",
    "gulpfile.js",
    "eslint.config.js",
  ]),
  {
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ActiveEffect: "readonly",
        ActiveEffectConfig: "readonly",
        Actor: "readonly",
        ActorSheet: "readonly",
        Actors: "readonly",
        Application: "readonly",
        CONFIG: "readonly",
        CONST: "readonly",
        ChatMessage: "readonly",
        Combat: "readonly",
        CombatTracker: "readonly",
        Combatant: "readonly",
        Dialog: "readonly",
        DocumentSheet: "readonly",
        FilePicker: "readonly",
        Folder: "readonly",
        FormApplication: "readonly",
        Handlebars: "readonly",
        Hooks: "readonly",
        InteractionLayer: "readonly",
        Item: "readonly",
        ItemSheet: "readonly",
        Items: "readonly",
        JournalEntry: "readonly",
        KeyboardManager: "readonly",
        Macro: "readonly",
        Roll: "readonly",
        RollTable: "readonly",
        SearchFilter: "readonly",
        SettingsConfig: "readonly",
        TextEditor: "readonly",
        VideoHelper: "readonly",
        canvas: "readonly",
        foundry: "readonly",
        fromUuid: "readonly",
        game: "readonly",
        getDocumentClass: "readonly",
        loadTemplates: "readonly",
        renderTemplate: "readonly",
        ui: "readonly",
        Die: "readonly",
        DiceTerm: "readonly",
        NumericTerm: "readonly",
        OperatorTerm: "readonly",
        fromUuidSync: "readonly",
      },

      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "no-console": "off",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "all",
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
