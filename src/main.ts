import {Plugin, Hotkey} from 'obsidian'
import AutocompleteView from './autocomplete'

export default class AutocompletePlugin extends Plugin {
  autocompleteView: AutocompleteView

  async onload() {
    this.autocompleteView = new AutocompleteView()
    console.log('Loading Obsidian Autocomplete...')

    this.addCommand({
      id: 'autocomplete-toggle',
      name: 'Toggle Autocomplete',
      hotkeys: [{
        modifiers: ["Ctrl"],
        key: " "
      }],
      callback: () => {
        const autocomplete = this.autocompleteView
        if (autocomplete.isShown())
          autocomplete.removeView()
        else
          autocomplete.showView()
      }
    })

    this.app.workspace.on('codemirror', (editor) => {
      editor.on('keyup', async (cm, _) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        const updatedView = this.autocompleteView.updateView(cursor, currentLine)

        if (updatedView)
          this.appendWidget(cm, updatedView)
      })
    })
  }

  async onunload() {
    this.autocompleteView.removeView()
    console.log('Bye!')
  }

  private appendWidget(editor: CodeMirror.Editor, view: HTMLElement, scrollable = true) {
    const cursor = editor.getCursor()

    editor.addWidget({ch: cursor.ch, line: cursor.line}, view, scrollable)
  }
}
