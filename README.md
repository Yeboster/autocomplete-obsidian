# Autocomplete Obsidian Plugin

This plugin provides a text autocomplete feature to enhance typing speed.

> ⚠️ This plugin is no longer maintained as I'm not using Obsidian anymore.
> 
> I might update it in the future, but until then, please use other plugins like [Obsidian completr](https://github.com/tth05/obsidian-completr)


![Preview](https://media.giphy.com/media/CFbhjfTLDPnUm45vje/giphy.gif)

> The plugin is still WIP, so if you encounter bugs please open an [Github issue](https://github.com/Yeboster/autocomplete-obsidian/issues/new/choose) with the steps to reproduce it.

## Features

There are the current and planned features.

- Default autocomplete features:
  - Trigger autocomplete:
    - manually with `ctrl+space` or `Toggle Autocomplete` command
    - Automatically using auto **trigger autocomplete while writing** for a seamless writing experience
      - Customize trigger from n-th character in settings
  - Change suggestion with `Ctrl-n/p` or `up/down arrows` and select with `enter/tab`
  - Seamless integration with vim mode
- Tokenizer for multiple languages (for now Arabic, Japanese and a default):
  - Change default tokenizer in settings or click on statusbar (`strategy: ...`)
  - Customize word separators per language
- Suggest completions with text providers:
  - LaTex
  - Flow (suggests words already written in the current session)
    - Current file (triggered on `change-file` and `load` events)
      - Trigger manual scan of different language with command `Autocomplete: Scan current file (language)`
  - [ ] Custom file
- Cursor placement for LaTeX functions:
  - Single function param
  - [ ] Multiple function params
- [ ] Snippets support (h3 -> ###)
- [ ] Proper layout management (Improve autocomplete popup position)
- [ ] Context aware (Latex trigger only inside `$$` block)
- [ ] Improve autocomplete scroll

> Do have you a nice feature to add or you want to change priorities (order of features)? Please open an [Github issue](https://github.com/Yeboster/autocomplete-obsidian/issues/new/choose).

## Contributing

If you'd like to improve this plugin, you are welcome ❤️
Make a pull request on the `develop` branch (because we're using [git-flow](https://github.com/nvie/gitflow))
