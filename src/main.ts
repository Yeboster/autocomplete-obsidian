import {MarkdownView, Plugin} from 'obsidian'
import AutocompleteView from './autocomplete'

export default class AutocompletePlugin extends Plugin {
  autocompleteView: AutocompleteView
  keymaps: CodeMirror.KeyMap

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
        const view = this.app.workspace.activeLeaf.view
        if (view instanceof MarkdownView) {
          const autocomplete = this.autocompleteView
          const editor = view.sourceMode.cmEditor

          if (autocomplete.isShown()) {
            this.addKeybindings(editor, false)
            autocomplete.removeView()
          }
          else {
            this.addKeybindings(editor)
            const cursor = editor.getCursor()
            autocomplete.showView(cursor)
          }
        }
      }
    })

    this.app.workspace.on('codemirror', (editor) => {
      editor.on('keyup', (cm) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        const updatedView = this.autocompleteView.updateView(currentLine, cursor)

        if (updatedView)
          this.appendWidget(cm, updatedView)
      })
    })
  }

  private addKeybindings(editor: CodeMirror.Editor, add = true) {
    if (!this.keymaps)
      this.keymaps = {
        "Ctrl-P": () => this.autocompleteView.selectPrevious(),
        "Ctrl-N": () => this.autocompleteView.selectNext(),
        Down: () => this.autocompleteView.selectNext(),
        Up: () => this.autocompleteView.selectPrevious(),
        Enter: (editor) => {
          this.selectSuggestion(editor)
          this.addKeybindings(editor, false)
        },
        Esc: (editor) => {
          this.autocompleteView.removeView()
          this.addKeybindings(editor, false)
        },
      }

    if (add)
      editor.addKeyMap(this.keymaps)
    else
      // Remove needs object reference
      editor.removeKeyMap(this.keymaps)
  }

  private selectSuggestion(editor: CodeMirror.Editor) {
    const cursor = editor.getCursor()
    const [selected, replaceFrom, replaceTo] = this.autocompleteView.getSelectedAndPosition(cursor)
    editor.operation(() => {
      editor.replaceRange(selected, replaceFrom, replaceTo)

      const newCursorPosition = replaceFrom.ch + selected.length
      const updatedCursor = {
        line: cursor.line,
        ch: newCursorPosition
      }
      editor.setCursor(updatedCursor)
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
