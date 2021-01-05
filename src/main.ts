import {MarkdownView, Plugin} from 'obsidian'
import AutocompleteView from './autocomplete'

export default class AutocompletePlugin extends Plugin {
  private autocompleteView: AutocompleteView
  private keyupListener: (cm: CodeMirror.Editor, event: KeyboardEvent) => void
  private lastUsedEditor: CodeMirror.Editor

  async onload() {
    console.log('Loading Obsidian Autocomplete...')
    this.autocompleteView = new AutocompleteView()

    this.addCommand({
      id: 'autocomplete-toggle',
      name: 'Toggle Autocomplete',
      hotkeys: [{
        modifiers: ["Ctrl"],
        key: " "
      }],
      callback: () => {
        const editor = this.getCurrentEditor()

        if (editor) {
          const autocomplete = this.autocompleteView

          if (!this.lastUsedEditor) this.lastUsedEditor = editor
          if (editor !== this.lastUsedEditor) {
            autocomplete.removeView(this.lastUsedEditor)
            this.lastUsedEditor = editor
          }

          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim') return

          if (autocomplete.isShown())
            autocomplete.removeView(editor)
          else
            autocomplete.showView(editor)
        }
      }
    })

    this.keyupListener = (cm: CodeMirror.Editor, event: KeyboardEvent) => {
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

      const autocompleteView = this.autocompleteView.getView(currentLine, cm)

      if (autocompleteView)
        this.appendWidget(cm, autocompleteView)

      this.autocompleteView.scrollToSelected()
    }

    this.registerCodeMirror(editor => {
      editor.on('keyup', this.keyupListener)
    })
  }

  async onunload() {
    const workspace = this.app.workspace
    workspace.iterateCodeMirrors(cm => {
      cm.off('keyup', this.keyupListener.bind(this))
      this.autocompleteView.removeView(cm)
    })
    console.log('Unloaded Obsidian Autocomplete')
  }


  private appendWidget(editor: CodeMirror.Editor, view: HTMLElement, scrollable = true) {
    const cursor = editor.getCursor()

    editor.addWidget({ch: cursor.ch, line: cursor.line}, view, scrollable)
  }

  private getCurrentEditor(): CodeMirror.Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)

    let editor = undefined
    if (view)
      editor = view.sourceMode.cmEditor

    return editor
  }
}
