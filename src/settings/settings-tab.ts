import { App, PluginSettingTab, Setting } from 'obsidian'
import AutocompletePlugin from '../main'

export class AutocompleteSettingsTab extends PluginSettingTab {
  plugin: AutocompletePlugin

  constructor(app: App, plugin: AutocompletePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Enabled')
      .setDesc('Set the autocomplete state')
      .addToggle((cb) =>
        cb.setValue(this.plugin.settings.enabled).onChange((value) => {
          this.plugin.settings.enabled = value
          this.plugin.saveData(this.plugin.settings)
          this.plugin.refresh()
        })
      )

    // Providers
    containerEl.createEl('h3', {
      text: 'Providers',
    })
    containerEl.createEl('br')

    new Setting(containerEl)
      .setName('LaTex Provider')
      .setDesc('Toggle LaTex suggestions')
      .addToggle((cb) =>
        cb.setValue(this.plugin.settings.latexProvider).onChange((value) => {
          this.plugin.settings.latexProvider = value
          this.plugin.saveData(this.plugin.settings)
          this.plugin.refresh()
        })
      )
  }
}
