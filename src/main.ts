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

          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim')
            return

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
      editor.on('keyup', (cm, event) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        // Need to update previous/next state here,
        // otherwise the view is not updated correctly
        // (Because I'm trying to cache it)
        // Missing pattern matching with arrays :(
        switch (`${event.ctrlKey} ${event.key}`) {
          case "true p":
            this.autocompleteView.selectPrevious()
            break
          case "true n":
            this.autocompleteView.selectNext()
            break
          case "false ArrowUp":
            this.autocompleteView.selectPrevious()
            break
          case "false ArrowDown":
            this.autocompleteView.selectNext()
            break
        }

        const updatedView = this.autocompleteView.updateView(currentLine, cursor)

        if (updatedView)
          this.appendWidget(cm, updatedView)

        this.autocompleteView.viewRenderedCallback()
      })
    })
  }

  private addKeybindings(editor: CodeMirror.Editor, add = true) {
    if (!this.keymaps)
      this.keymaps = {
        // Override keymaps but manage them into "keyup" event
        // Because need to update selectedIndex right before updating view
        "Ctrl-P": () => {},
        "Ctrl-N": () => {},
        Down: () => {},
        Up: () => {},
        Enter: (editor) => {
          this.selectSuggestion(editor)
          this.addKeybindings(editor, false)
        },
        Esc: (editor) => {
          this.autocompleteView.removeView()
          this.addKeybindings(editor, false)
          if (editor.getOption('keyMap') === 'vim-insert')
            editor.setOption('keyMap', 'vim')
        },
      }

    if (add)
      editor.addKeyMap(this.keymaps)
    else // Remove needs object reference
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
    console.log('Unloaded Obsidian Autocomplete')
  }

  private appendWidget(editor: CodeMirror.Editor, view: HTMLElement, scrollable = true) {
    const cursor = editor.getCursor()

    editor.addWidget({ch: cursor.ch, line: cursor.line}, view, scrollable)
  }
}
