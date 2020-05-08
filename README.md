# Token Mold
<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/moerill/token-mold?style=for-the-badge">  
<img alt="GitHub" src="https://img.shields.io/github/license/moerill/token-mold?style=for-the-badge">  
<img alt="GitHub Releases" src="https://img.shields.io/github/downloads/moerill/token-mold/latest/total?style=for-the-badge">  


What is a foundry without its molds? This module provides you with a customizable mold for your Tokens.  
On creation each Token will fit snuggly into the pattern of your mold.  

## Feature Overview
- [Automatic indexing](#automatic-indexing)
- [Random name generation](#random-name-generation) from 35(!) languages
- [Override token config](#override-token-config)
- [Auras/Sticky Templates](#sticky-templates). Make your templates follow your tokens around and even rotate with them.
- [Customizable overlay](#customizable-token-overlay) on token hover, for quick reference
- [Automatic name hiding](#hide-names)
- [Hit Point rolling](#hit-point-rolling) by formula (currently dnd5e only)
- [Automatic token scaling](#automatic-token-scaling) according to creature size and map grid distance.  (dnd5e and pf2e only)

## Installation
- Copy [https://gitlab.com/moerills-fvtt-modules/token-mold/raw/master/module.json](https://gitlab.com/moerills-fvtt-modules/token-mold/raw/master/module.json) into the module installer inside foundry
- Press install and wait for it to finish
- Start your world and activate the module

## Usage
Pull a token onto the canvas and the chosen pattern will be automatically applied to your Token.
![Usage](doc/usage.gif)  

## FAQ
### Why are there so many confusing attributes to choose from?
To allow *Token-Mold* to be usable for all kind of systems the module generates a list of possible attribute values dependend on the systems default data model. Since the module can not decide which are useful to use or which are not all possible values are shown. Although this may be kind of confusing or annoying this is a decision made to ensure that most *Token-Mold* features are universally usable.

### Why are there only squares shown for icon selections dropdown in Firefox?
This is a current bug in Firefox in combination with icons inside of html options tags. They will show properly inside the select box when selected though. My suggestion here is that you either focus the box and then switch between the selections using the arrow keys or use a different browser for this configuration.  
After they're selected they should display fine in the overlay and the select box!

### Why does the sticky template only move if the GM moves the token?  
Due to FVTTs permission settings players may only manipulate their own templates. So for a player to be able to use sticky templates properly, **make sure that the player controlling the token created the template**.  
For GMs this restriction does not apply, since they can manipulate even user created templates.  
I may try to find a workaround for this in the future, but for the time being this restriction will stay.

## Automatic Indexing
You like to name all your goats "goat"? Don't worry this mod is here to help you differentiate them!
Just let *Token-Mold* add a number as suffix and you're fine.  
  
You want to let your goat army sound bigger than they really are? Don't worry, *Token-Mold* got you covered!  
Besides just counting upwards on the indexing, you can even set a random offset range, to provide some variety and prevent metagaming from your players. ("Oh we can see goat 1 and 4.. so at least 2 are missing!")  

![Random Prefix Options](doc/random_prefix.webp)  

## Naming options
### Random Name Generation
Tired of your whole army reacting, when you call "Kobold"?  
Try the new random name generator by trdischat!  
Choose from up to 35 different languages, to generate your names from.  
Do these names kind of almost sound like real words? Yes, absolutely! [Why?](#how-does-this-work?)  
Here a few examples:  
![Random Name Generation](doc/name_generation.webp)  
Some more explanation:  
You can create a list of your actors attributes, each with their own list of custom value - language pairs. When this option is active and you create a token *Token-Mold* will go through your list of attributes and values and tries to find the first attribute-value match, to select a language for the name generation. If no match is found, the default language will be taken.  
Using the chosen language *Token-Mold* will now generate a name for the token using trdischat awesome algorithm!  
**My advice here is to go from more specific values to more generic from top to bottom.** If we take the 5e system as example, we start with the very specific attribute ``name`` to check for creatures, like *Orcs,Kobolds, Goblins*. In the SRD the only way to specifically identify their type is through their name. Then we start to be more general by selecting the ``type`` attribute as a more generic form of identifying creatures. Here we choose values like *humanoid, beast, fiend, giant*.  

A bonus treat for DnD5e users: trdischat has created a predefined list of attributes, values and languages for you to use.  

Awesome, but..
#### How does this work?
The algorithm tries to generate a word using letter frequencies sampled for 35 different languages. So each letter is chosen randomly based on the previous two letters and weighted by their frequency of appereance. 

### Random adjectives
What? you can't speak those newly generated names out loud? No problem, here is some more help to make your minions more descriptive, by adding random (english) adjectives to their names!  
![Random Adjectives](doc/random_adjectives.webp)  


### Hide Names
Don't like names at all? You can just let *Token-Mold* delete the tokens name so your players will never know what hit them! (Or maybe they just know that it was **Bamboozled 8**, but not what he/she/it is.)


## Override Token Config
Don't like how you set up all your tokens? Or you dislike the default settings set for a compendium? Then you got the perfect module! Set your wanted configuration in the menu and it will automatically get applied to every token you from now on create!

## Sticky Templates
You miss auras in FVTT? or some kind of other template following your beloved tokens?  
Just use *Token-Mold*s sticky templates!  
![Sticky Templates](doc/sticky_template.gif)  

## Hit Point Rolling
(DnD5e only)
To lazy to roll your minions hit points yourself? Don't worry, *Token-Mold* automates that for you!
If you have a hit dice formula defined for your NPC, your token will automatically roll and set the hp, as well as notify you (if set to).  
![HP Rolling](doc/hp_rolling.webp)  

## Customizable Token Overlay
Want to quickly check how much money your minion can steal from your players without opening their sheet? Or quickly check their passive perception or armor class? Just configure the overlay to your liking and activate it. Now hover over the tokens to quickly check the set up stats!  
The overlay will only show if you're the tokens owner.  
![Overlay](doc/overlay.webp)  


## Automatic Token Scaling
(DnD5e and PF2 only)
Again to lazy to configure your tokens?  
Or got a 10ft map now and don't want to rescale everything?  
Just activate this feature and it will do the work for you, by automatically choosing the correct size based on the tokens set creature size and the map size. (Works only with scenes grid units set to multiples of "ft", "ft." or "feet")

## Attribution
Special thanks to @trdischat for providing the awesome name generation algorithm and data!
Also thanks to:
* @Brother Sharp for the japanese adjectives
* Ben Howard for extending the english adjective list massively
* @Cosmo Corban for the spanish adjectives

## Bug Reporting
Go to the [GitHub's issue board](https://github.com/Moerill/token-mold/issues) and check if the Bug is already reported. If not create a new issue, with at least the following information:
1. Token Mold version
2. FVTT version
3. Browser and OS used. Or if the app itself is used.
4. Bug description
	- What happened?
	- What should've happened?
	- Console errors? (F12 or F11 in most browsers)
5. Workflow to recreate the bug
6. Helpful videos or screenshots if possible


## Licensing
Token Mold is licensed under the [LGPLv3-License](https://github.com/Moerill/token-mold/blob/master/LICENSE).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Support the development
Want to help me develop? Send a merge request on this gitlab or contact me on Discord (Moerill#7205).  
Want to support me in another way? 
Leave me some nice comments (e.g. on Discord), recommend this module to others and/or leave a donation over at my [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FYZ294SP2JBGS&source=url).