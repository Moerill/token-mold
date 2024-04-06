# v2.20.4
- Updated to support DnD5e 3.x and Foundry v11

# v2.20.3
 - Corrected bug that prevented refresh tokens from functioning ( [[#181](https://github.com/Moerill/token-mold/issues/181)])
 
# V2.20.2
 - Corrected bug where certain systems define types of Actors not meant to be instantiated, breaking DocumentClass reading ( [#176](https://github.com/Moerill/token-mold/issues/176) )
 
# v2.20.1
 - Corrected bug with HP not rolling correctly ( [#173](https://github.com/Moerill/token-mold/issues/173)) )

# v2.20.0
 - Foundry v11 Compatibility Update ( [#167](https://github.com/Moerill/token-mold/issues/167))
 - Corrected bug that caused Token Mold to conflict with other modules due to overwriting certain data within the token ([#150](https://github.com/Moerill/token-mold/issues/150))
 - Corrected issue where bar attributes were being retrieved from the base Token Document, causing a problem if that document was overriden by the system ([#160](https://github.com/Moerill/token-mold/issues/160))
 
# v2.15.4
 - Adjusted resolutions to #137 & #138
 - Corrected an issue where refreshing selected tokens was causing a circular reference error ( [#141](https://github.com/Moerill/token-mold/issues/141) ).
 - Corrected an issue where the overlay could get disabled in certain cirucmstances ( [#51](https://github.com/Moerill/token-mold/issues/51) )

# v2.15.3
 - Corrected an issue where a conflict with certain game systems such as PF2E and a core Foundry v10 method that Token Mold utilizes could cause an infinite recursion error.  ( Issue #138)
 - Corrected an issue where overlays may not get displayed due in Foundry v10 due to deprecated data retrieval methods ( Issue #137 )
 - Added a new option to enable or disable the overlay for Linked Tokens ( Issue # 134 )

# v2.15.2
 - ***IMPORTANT*** Token Mold no longer supports v8 of Foundry.
 - FoundryVTT v10 Compatibility Update!
 - Updated Portugese adjectives, thanks to @Kingdorugha!
 - **Fix** Scaling issue with scenes that have large grid units
 - **Fix** You can no longer configure Token Mold to completely remove names, resulting in errors
 - **Fix** Updated compendium information
 - Various minor fixes and improvements to logging, updated documentation.

# v2.15.0
- Added support for DCC and SW5E systems, thanks to adotor and burndaflame respectively!
- Added integration with the Developer Mode module, greatly reducing the clutter in the console log.
- Corrected the 'compatible core version' as pointed out by Dawidlzydor as Token Mold is currently compatible with all versions of Foundry v9
- Added option to override name replacement if you hold SHIFT when dragging (with thanks to Kenster421 for this change!)

# v2.14.0
- Geekswordsman is now maintaining Token Mold while Moerill conquers Earth (or at least, IRL stuff!)
- Added Starfinder to supported systems
- Merged Spanish localization, with thanks to lozalojo!
- Merged Japanese localization, with thanks to BrotherSharper!
- **Fix** Added support for Foundry v9
- **Fix** Corrected a bug where Disposition was not properly getting saved ( Issue #60 )
- **Fix** Corrected a bug where token scaling could be set to extremely tiny numbers in certain situations ( Issue #75 ) 

# v2.13.1

- **Fix** Barattributes not using the correct actor types....

# v2.13

- Add chinese localization. Thanks to GitHub User 长耳 ( @FuyuEnnju ) for contributing this!
- Add [Bug reporter module](https://www.foundryvtt-hub.com/package/bug-reporter/) support
- Add [Developer Mode module](https://www.foundryvtt-hub.com/package/_dev-mode/) support

# v2.12

- Add german adjective list
- Removed "Men's Rights" from community curated english adjective list
- FVTT 0.8.5 compatibility

# v2.11.1

- fixed packaging

# v2.11

- Localization support, including german translation! Huge thanks to GitHub user @CarnVanBeck, who did _all_ the work!

# v2.10.1

- _FIX_ saving settings to break, if no adjective list was loaded before. (Happened e.g. when the set table doesn't exist anymore).

# v2.10.0

- Fixed compatibility issue with the multilevel token module. Thanks to github user @grandseiken for fixing this!
- Changed Settings from automatically saving every time a setting was changed, to prevent accidently downloading all dicts, just because on looked at the replace name setting.
- Added clarification that enabling name replacement results in about 100MB of extra memory usage for the GM. (Someone mentioned this and it catched me by surprise. I'll still look into it if there is something i can do, but i'm not sure about that.)

# v2.9

- New smaller but curated list of english adjectives. This list is designed to allow for a better narrative instead of just having a lot of random, but sometimes really unfitting, adjectives. Thanks to Reddit user u/VagabondVivant and Github user @focalmatter for providing this list.
  - This list is set to be the default for _new_ token mold users.

# v2.8.1

- Fixed error in manifest URL (which is probably harmless, but still just to be sure)

# v2.8

- _IMPORTANT_ Removed sticky templates from token mold! There is now a dedicated module for sticking stuff to tokens: ![Token Attacher by Kayelgee](https://foundryvtt.com/packages/token-attacher/)
- Now also overwriting the tokens actor name, on name generation.
- _FIX_ Tab content not being shown in FVTT 0.7.X
- Removed the welcome screen / popup
- _FIX_ some deprecated code used in the regenerating names function.
- Removed bundling through webpack. Now only native ESM 6 modules are used.
  - Reason: slowness when building for development, less complications for people wanting to contribute
  - Modified the dict files, to be native ESM6 modules enow instead of json files.

# v2.7.1

<ul>
	<li>*NEW* Portuguese adjective lists, thanks to Discord User @innocenti</li>
	<li>*FIX* Update not working. (hopefully)</li>
</ul>

<h1>v2.7.0</h1>
<ul>
	<li>*NEW* French adjective rollable table, thanks to Discord User @MagicRabbit</li>
	<li>*NEW* You can now decide whether adjectives should be placed before or behind the name.</li>
	<li>*FIX* Overriding bars to "NONE" not working.</li>
	<li>*FIX* DnD5e token scaling feature not respecting "apply to unlinked only" setting</li>
	<li>*FIX* Some reasons resulting in the overlay not being activated.</li>
	<li>*FIX* Different errors shown for tokens without representing actors</li>
	<li>*FIX* Settings menu not showing the correct setting for vertical mirroring.</li>
</ul>

# v2.6.1

- Fixed FVTT 0.6.0 incompatibilities
- Fixed some errors

# v2.6

- _Important_: Changed from GitLab to GitHub. The new Repositories link is <a href="https://github.com/Moerill/token-mold">https://github.com/Moerill/token-mold</a>. For issues and suggestions please use the githubs issue board.
- Added a reapply button to the quick settings. This button does reapply all current settings to the selected tokens, as if they were newly placed onto the scene.
- Added some info and links to the GitHub page to the settings menu.
- Added ability to randomize horizontal and vertical mirroring.
- Now using Webpack
- Fixed some issues when loading the dictionary
  - Split it into multiple smaller parts
  - Import now using import statements instead of the fetch API, resulting in hopefully more reliable results.
  - Only loading the dictionary, when the setting to use it is set.
- Fixed not being able to set the configs for token bars.
- Switched to the not so new TabsV2 for the application class.
