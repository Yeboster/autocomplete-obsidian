import {MarkdownView, Plugin} from 'obsidian'
import AutocompleteView from './autocomplete'

export default class AutocompletePlugin extends Plugin {
  private autocompleteView: AutocompleteView

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
        const editor = this.getCurrentEditor()
        if (editor) {
          const autocomplete = this.autocompleteView

          // Do not open on vim normal mode
          if (editor.getOption('keyMap') === 'vim') return

          if (autocomplete.isShown())
            autocomplete.removeView(editor)
          else
            autocomplete.showView(editor)
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

        const autocompleteView = this.autocompleteView.getView(currentLine, cm)

        if (autocompleteView)
          this.appendWidget(cm, autocompleteView)

        this.autocompleteView.viewRenderedCallback()
      })
    })
  }

  async onunload() {
    const editor = this.getCurrentEditor()
    if (editor)
      this.autocompleteView.removeView(editor)
    console.log('Unloaded Obsidian Autocomplete')
  }

  private appendWidget(editor: CodeMirror.Editor, view: HTMLElement, scrollable = true) {
    const cursor = editor.getCursor()

    editor.addWidget({ch: cursor.ch, line: cursor.line}, view, scrollable)
  }

  private getCurrentEditor(): CodeMirror.Editor | null {
    const view = this.app.workspace.activeLeaf.view

    let editor = undefined
    if (view instanceof MarkdownView)
      editor = view.sourceMode.cmEditor

    return editor
  }
}
