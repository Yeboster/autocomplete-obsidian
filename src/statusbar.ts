import { Plugin } from 'obsidian'
import {
  TokenizeStrategy,
  TOKENIZE_STRATEGIES,
} from './providers/flow/tokenizer'
import { AutocompleteSettings } from './settings/settings'

export class StatusBarView {
  private readonly plugin: Plugin
  private settings: AutocompleteSettings

  private statusBar: HTMLElement

  constructor(plugin: Plugin, settings: AutocompleteSettings) {
    this.plugin = plugin
    this.settings = settings
  }

  addStatusBar() {
    if (!this.settings.flowProviderScanCurrent) return

    const statusBar = this.plugin.addStatusBarItem()
    statusBar.addClass('mod-clickable')
    statusBar.innerHTML = this.getStatusBarText(
      this.settings.flowProviderScanCurrentStrategy
    )
    statusBar.addEventListener('click', this.onStatusBarClick)

    this.statusBar = statusBar
  }

  removeStatusBar() {
    if (!this.statusBar) return

    this.statusBar.removeEventListener('click', this.onStatusBarClick)
    this.statusBar.remove()
  }

  onStatusBarClick = () => {
    const currentStrategy = this.settings.flowProviderScanCurrentStrategy
    const currentIndex = TOKENIZE_STRATEGIES.findIndex(
      (strategy) => strategy === currentStrategy
    )
    const newStrategy =
      currentIndex === TOKENIZE_STRATEGIES.length - 1
        ? TOKENIZE_STRATEGIES[0]
        : TOKENIZE_STRATEGIES[currentIndex + 1]

    this.settings.flowProviderScanCurrentStrategy = newStrategy
    this.plugin.saveData(this.settings)

    this.statusBar.innerHTML = this.getStatusBarText(newStrategy)
  }

  private getStatusBarText(strategy: TokenizeStrategy) {
    return `strategy: ${strategy}`
  }
}
