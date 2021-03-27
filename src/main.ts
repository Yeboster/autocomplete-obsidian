import { MarkdownView, Notice, Plugin, TFile } from 'obsidian'
import { Autocomplete } from './autocomplete'
import { TOKENIZE_STRATEGIES } from './providers/flow/tokenizer'
import { AutocompleteSettings } from './settings/settings'
import { AutocompleteSettingsTab } from './settings/settings-tab'
import { StatusBarView } from './statusbar'

export default class AutocompletePlugin extends Plugin {
  private autocomplete: Autocomplete
  private lastUsedEditor: CodeMirror.Editor

  private statusBar: StatusBarView

  settings: AutocompleteSettings

  async onload() {
    console.log('Loading Autocomplete plugin.')
    this.settings = Object.assign(
      new AutocompleteSettings(),
      await this.loadData()
    )
    this.addSettingTab(new AutocompleteSettingsTab(this.app, this))

    if (!this.settings.enabled) return

    this.statusBar = new StatusBarView(this, this.settings)
    this.enable()
    this.addCommands()
  }

  async onunload() {
    console.log('Unloaded Obsidian Autocomplete')
    this.disable()
  }

  async refresh() {
    this.disable()
    this.enable()
  }

  private addCommands() {
    this.addCommand({
      id: 'autocomplete-toggle',
      name: 'Toggle Autocomplete',
      hotkeys: [
        {
          modifiers: ['Ctrl'],
          key: ' ',
        },
      ],
      callback: () => {
        const autocomplete = this.autocomplete
        const editor = this.getValidEditorFor(autocomplete)

        if (editor) {
          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim') return

          autocomplete.toggleViewIn(editor)
        }
      },
    })

    this.addScanCommands()
  }

  enable() {
    this.autocomplete = new Autocomplete(this.settings)

    const settings = this.settings
    if (settings.flowProviderScanCurrent)
      // Passing autocomplete as context
      this.app.workspace.on('file-open', this.onFileOpened, this)

    this.registerCodeMirror((editor) => {
      editor.on('keyup', this.keyUpListener)
    })

    if (settings.flowProviderScanCurrent) {
      this.statusBar.addStatusBar()
      const file = this.app.workspace.getActiveFile()
      this.autocomplete.scanFile(file, settings.flowProviderTokenizeStrategy)
    }
  }

  disable() {
    const workspace = this.app.workspace
    // Always remove to avoid any kind problem
    workspace.off('file-open', this.onFileOpened)

    this.statusBar.removeStatusBar()

    workspace.iterateCodeMirrors((cm) => {
      cm.off('keyup', this.keyUpListener)
      this.autocomplete.removeViewFrom(cm)
    })
  }

  private addScanCommands() {
    TOKENIZE_STRATEGIES.forEach((type) => {
      const capitalized = type.replace(/^\w/, (c) => c.toLocaleUpperCase())
      const name = `Scan current file ${
        type !== 'default' ? `(${capitalized})` : ''
      }`

      this.addCommand({
        id: `autocomplete-scan-current-file-${type}`,
        name,
        callback: () => {
          if (!this.settings.flowProviderScanCurrent) {
            new Notice(
              'Please activate setting flow Provider: Scan current file'
            )
          }

          const autocomplete = this.autocomplete
          const editor = this.getValidEditorFor(autocomplete)

          if (editor) {
            const file = this.app.workspace.getActiveFile()
            autocomplete.scanFile(file, type)
          }
        },
      })
    })
  }

  private keyUpListener = (editor: CodeMirror.Editor, event: KeyboardEvent) => {
    const autocomplete = this.autocomplete
    autocomplete.updateProvidersFrom(event, editor)

    if (!autocomplete.isShown) return

    this.updateEditorIfChanged(editor, autocomplete)

    this.autocomplete.updateViewIn(editor, event)
  }

  private onFileOpened(file: TFile) {
    this.autocomplete.scanFile(file)
  }

  private getValidEditorFor(
    autocomplete: Autocomplete
  ): CodeMirror.Editor | null {
    const currentEditor = this.getCurrentEditor()

    if (currentEditor) this.updateEditorIfChanged(currentEditor, autocomplete)

    return currentEditor
  }

  private updateEditorIfChanged(
    editor: CodeMirror.Editor,
    autocomplete: Autocomplete
  ) {
    if (!this.lastUsedEditor) this.lastUsedEditor = editor

    if (editor !== this.lastUsedEditor) {
      autocomplete.removeViewFrom(this.lastUsedEditor)
      this.lastUsedEditor = editor
    }
  }

  private getCurrentEditor(): CodeMirror.Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)

    return view ? view.sourceMode.cmEditor : null
  }
}
