import {MarkdownView, Plugin} from 'obsidian'
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
        else {
          const view = this.app.workspace.activeLeaf.view
          if (view instanceof MarkdownView) {
            const cursor = view.sourceMode.cmEditor.getCursor()
            autocomplete.showView(cursor)
          }
        }
      }
    })

    this.app.workspace.on('codemirror', (editor) => {
      editor.on('keyup', async (cm, event) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        // For now using ctrl+j/l
        // TODO: Convert to ctrl+n/p
        if (event.ctrlKey) {
          switch (event.key) {
            case 'j':
              // Down
              this.autocompleteView.selectNext()
              break
            // l instead of j because Ctrl+k in insert mode removes the content on the right
            case 'l': 
              // Up
              this.autocompleteView.selectPrevious()
              break
            case 'Enter':
              // Use selected item
              this.selectSuggestion(cursor, cm)
              break
          }
        }

        const updatedView = this.autocompleteView.updateView(currentLine, cursor)

        if (updatedView)
          this.appendWidget(cm, updatedView)
      })
    })
  }

  private selectSuggestion(cursor: CodeMirror.Position, cm: CodeMirror.Editor) {
    const [selected, replaceFrom, replaceTo] = this.autocompleteView.getSelectedAndPosition(cursor)
    cm.operation(() => {
      cm.replaceRange(selected, replaceFrom, replaceTo)

      const newCursorPosition = replaceFrom.ch + selected.length
      const updatedCursor = {
        line: cursor.line,
        ch: newCursorPosition
      }
      cm.setCursor(updatedCursor)
    })
    this.autocompleteView.removeView()
  }

  async onunload() {
    this.autocompleteView.removeView()
    console.log('Bye!')
  }

  private appendWidget(editor: CodeMirror.Editor, view: HTMLElement, scrollable = true) {
    const cursor = editor.getCursor()

    editor.addWidget({ch: cursor.ch, line: cursor.line}, view, scrollable)
    this.autocompleteView.viewRenderedCallback()
  }
}
