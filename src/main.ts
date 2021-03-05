import { MarkdownView, Plugin } from 'obsidian'
import AutocompleteView from './autocomplete'
import { AutocompleteSettings } from './settings/settings'
import { AutocompleteSettingsTab } from './settings/settings-tab'

export default class AutocompletePlugin extends Plugin {
  private autocompleteView: AutocompleteView
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

    this.autocompleteView = new AutocompleteView(this.settings)

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
          const autocomplete = this.autocompleteView

          this.updateEditorIfChanged(editor, autocomplete)

          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim') return

          const isEnabled = this.settings.enabled
          if (autocomplete.isShown() || !isEnabled)
            autocomplete.removeView(editor)
          else if (isEnabled) autocomplete.showView(editor)
        }
      },
    })

    this.enable()
  }

  async onunload() {
    console.log('Unloaded Obsidian Autocomplete')
    this.disable()
  }

  async refresh() {
    this.disable()
    this.enable()
  }

  enable() {
    this.autocompleteView.loadProviders()
    this.registerCodeMirror((editor) => {
      editor.on('keyup', this.keyupListener)
    })
  }

  disable() {
    const workspace = this.app.workspace
    workspace.iterateCodeMirrors((cm) => {
      cm.off('keyup', this.keyupListener)
      this.autocompleteView.removeView(cm)
    })
  }

  private keyupListener = (cm: CodeMirror.Editor, event: KeyboardEvent) => {
    const autocomplete = this.autocompleteView

    this.updateEditorIfChanged(cm, autocomplete)

    const cursor = cm.getCursor()
    const currentLineNumber = cursor.line
    const currentLine: string = cm.getLine(currentLineNumber)

    // Need to update previous/next state here,
    // otherwise the view is not updated correctly
    // (Because I'm trying to cache it)
    // Missing pattern matching with arrays :(
    switch (`${event.ctrlKey} ${event.key}`) {
      case 'true p':
        autocomplete.selectPrevious()
        break
      case 'true n':
        autocomplete.selectNext()
        break
      case 'false ArrowUp':
        autocomplete.selectPrevious()
        break
      case 'false ArrowDown':
        autocomplete.selectNext()
        break
    }

    const autocompleteView = autocomplete.getView(currentLine, cm)

    if (autocompleteView) this.appendWidget(cm, autocompleteView)

    autocomplete.scrollToSelected()
  }

  private updateEditorIfChanged(
    editor: CodeMirror.Editor,
    autocomplete: AutocompleteView
  ) {
    if (!this.lastUsedEditor) this.lastUsedEditor = editor

    if (editor !== this.lastUsedEditor) {
      autocomplete.removeView(this.lastUsedEditor)
      this.lastUsedEditor = editor
    }
  }

  private appendWidget(
    editor: CodeMirror.Editor,
    view: HTMLElement,
    scrollable = true
  ) {
    const cursor = editor.getCursor()

    editor.addWidget({ ch: cursor.ch, line: cursor.line }, view, scrollable)
  }

  private getCurrentEditor(): CodeMirror.Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)

    return view ? view.sourceMode.cmEditor : null
  }
}
