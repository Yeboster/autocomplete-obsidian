import { MarkdownView, Plugin } from 'obsidian'
import { Autocomplete } from './autocomplete'
import { AutocompleteSettings } from './settings/settings'
import { AutocompleteSettingsTab } from './settings/settings-tab'

export default class AutocompletePlugin extends Plugin {
  private autocomplete: Autocomplete
  private lastUsedEditor: CodeMirror.Editor
  settings: AutocompleteSettings

  async onload() {
    console.log('Loading Autocomplete plugin.')
    this.settings = Object.assign(
      new AutocompleteSettings(),
      await this.loadData()
    )
    this.addSettingTab(new AutocompleteSettingsTab(this.app, this))

    if (!this.settings.enabled) return

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
        const editor = this.getCurrentEditor()

        if (editor) {
          const autocomplete = this.autocomplete

          this.updateEditorIfChanged(editor, autocomplete)

          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim') return

          this.autocomplete.toggleViewIn(editor)
        }
      },
    })
  }

  enable() {
    this.autocomplete = new Autocomplete(this.settings)
    this.registerCodeMirror((editor) => {
      editor.on('keyup', this.keyUpListener)
    })
  }

  disable() {
    const workspace = this.app.workspace
    workspace.iterateCodeMirrors((cm) => {
      cm.off('keyup', this.keyUpListener)
      this.autocomplete.removeViewFrom(cm)
    })
  }

  private keyUpListener = (editor: CodeMirror.Editor, event: KeyboardEvent) => {
    const autocomplete = this.autocomplete
    if (!autocomplete.isShown()) return

    this.updateEditorIfChanged(editor, autocomplete)

    this.autocomplete.updateViewIn(editor, event)
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
