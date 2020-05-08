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
