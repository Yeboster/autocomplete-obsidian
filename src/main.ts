import {Plugin} from 'obsidian'
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
      editor.on('keyup', async (cm, event) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        // For now using ctrl+j/k
        // TODO: Convert to ctrl+n/p
        console.log(event)
        if (event.ctrlKey) {
          switch (event.key) {
            case 'j':
              // Down
              this.autocompleteView.selectNext()
              break
            case 'k':
              // Up
              this.autocompleteView.selectPrevious()
              break
            case 'Enter':
              // Use selected item
              const [selected, replaceFrom] = this.autocompleteView.getSelectedAndPosition(currentLine, cursor)
              cm.operation(() => {
                cm.replaceRange(selected, replaceFrom, cursor)

                const newCursorPosition = replaceFrom.ch + selected.length
                const updatedCursor = {
                  line: cursor.line,
                  ch: newCursorPosition
                }
                cm.setCursor(updatedCursor)
              })
              this.autocompleteView.removeView()
              break
          }
        }

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
