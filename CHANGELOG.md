# v2.9.1

- Fixed compatibility issue with the multilevel token module. Thanks to github user @grandseiken for fixing this!
- Changed Settings from automatically saving every time a setting was changed, to prevent accidently downloading all dicts, just because on looked at the replace name setting.
- Added clarification that enabling name replacement results in about 100MB of extra memory usage for the GM. (Someone mentioned this and it catched me by surprise. I'll still look into it if there is something i can do, but i'm not sure about that.)

# v2.9

- New smaller but curated list of english adjectives. This list is designed to allow for a better narrative instead of just having a lot of random, but sometimes really unfitting, adjectives. Thanks to Reddit user u/VagabondVivant and Github user @focalmatter for providing this list.
  - This list is set to be the default for *new* token mold users.

# v2.8.1

- Fixed error in manifest URL (which is probably harmless, but still just to be sure)

# v2.8

- *IMPORTANT* Removed sticky templates from token mold! There is now a dedicated module for sticking stuff to tokens: ![Token Attacher by Kayelgee](https://foundryvtt.com/packages/token-attacher/)
- Now also overwriting the tokens actor name, on name generation.
- *FIX* Tab content not being shown in FVTT 0.7.X
- Removed the welcome screen / popup
- *FIX* some deprecated code used in the regenerating names function.
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
* Fixed FVTT 0.6.0 incompatibilities
* Fixed some errors

# v2.6
* *Important*: Changed from GitLab to GitHub. The new Repositories link is <a href="https://github.com/Moerill/token-mold">https://github.com/Moerill/token-mold</a>. For issues and suggestions please use the githubs issue board.
* Added a reapply button to the quick settings. This button does reapply all current settings to the selected tokens, as if they were newly placed onto the scene.
* Added some info and links to the GitHub page to the settings menu.
* Added ability to randomize horizontal and vertical mirroring.
* Now using Webpack
* Fixed some issues when loading the dictionary
	- Split it into multiple smaller parts
	- Import now using import statements instead of the fetch API, resulting in hopefully more reliable results.
	- Only loading the dictionary, when the setting to use it is set.
* Fixed not being able to set the configs for token bars.
* Switched to the not so new TabsV2 for the application class.
