# 0.7.4
- Fix autocomplete trigger by using key-down event
- Implement optional trigger like vim (ctrl-n/p)

# 0.7.3
- Use layoutReady event to scan file on load
- Avoid showing redundant suggestions (input is equal)
- Fix duplicated suggestions
- Select automatically suggestion if there is only one
- Partially revert sort order to show shorter words first
- Improve settings tab (order and settings name)

# 0.7.2
- Fix JapaneseTokenizer

# 0.7.1
- Fix autocomplete scan exception and pass strategy
- Show status bar when flowProvider is enabled
- Update validation message for status bar

# 0.7.0
- Improve sort order
- Add current file scanning 🎉
- Implement tokenizer for Arabic, Japanese languages and a default. Thanks @tadashi-aikawa!
- Close autocomplete on space
- Add statusbar for tokenizer
- Prioritize FlowProvider suggestions

# 0.6.2
- Fix removeView

# 0.6.1
- Improve word detection
- Improve autocomplete trigger context
- Show empty autocomplete view
- Update autocomplete prompt

# 0.6.0
- Move cursor into placeholder, if any
- Updated features plan in readme
- Added Flow provider
- Updated gif in readme

# 0.5.10
- Forgot to update version files 🤦

# 0.5.9
- Add Settings
- Refactor core

# 0.5.8
- Added Latex mathcal suggestion. (#1)

# 0.5.7
- Use `firstElementChild` instead of `firstChild`

# 0.5.6
- Properly unhook clickListener
- Minor refactoring

# 0.5.5
- Check current editor also on keyup event
- Github workflow: Properly fix bash if else statement

# 0.5.4
- Fix github release workflow to work with sh.

# 0.5.3
- Hardcode Obsidian API version to 0.10.0

# 0.5.2
- Remove listeners on unload
- Use suggested methods of Obsidian API
- Experimental management of multiple panes
- Sort suggestions
- Added github workflow

# 0.5.1
Fix readme gif

# 0.5.0
First release 🎉
