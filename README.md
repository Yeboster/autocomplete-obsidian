# Autocomplete Obsidian Plugin

This plugin provides a text autocomplete feature to enhance typing speed.

![Preview](https://media.giphy.com/media/CFbhjfTLDPnUm45vje/giphy.gif)

> The plugin is still WIP, so if you encounter bugs please open an [Github issue](https://github.com/Yeboster/autocomplete-obsidian/issues/new/choose) with the steps to reproduce it.

## Features

There are the current and planned features:

- [x] Trigger autocomplete with `ctrl+space` or `Toggle Autocomplete` command
- [x] Change suggestion with `Ctrl-n/p` or `up/down arrows` and select with `enter`
- [x] Autocomplete view style as Obsidian
- [x] Supports multiple autocomplete providers (for now Latex)
- [x] Seamless integration with vim mode
- Cursor placement on marks:
  - [x] Single cursor placement
  - [ ] Multiple cursor placement on marks (Latex functions)
- Text Providers:
  - [x] LaTex
  - [x] Flow (suggests words already written in the current session)
  - [ ] Current file
  - [ ] Custom file
- [ ] Snippets support (h3 -> ###)
- [ ] Proper layout management (Improve autocomplete popup position)
- [ ] Context aware (Latex trigger only inside `$$` block)
- [ ] Improve autocomplete scroll

> Do have you a nice feature to add or you want to change priorities (order of features)? Please open an [Github issue](https://github.com/Yeboster/autocomplete-obsidian/issues/new/choose).

## Contributing

If you'd like to improve this plugin, you are welcome ❤️
Make a pull request on the `develop` branch (because we're using [git-flow](https://github.com/nvie/gitflow))
