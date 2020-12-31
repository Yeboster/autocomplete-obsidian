import {Completion, Provider} from './providers/provider'
import LatexProvider from './providers/latex'

// TODO: Refactor business logic into module
export default class AutocompleteView {
  private view: HTMLElement
  private show: boolean
  private keymaps: CodeMirror.KeyMap
  private onClickCallback: (event: MouseEvent) => void
  private providers: Provider[]
  private suggestions: Completion[]
  private selectedIndex?: number
  private currentText?: string
  private cursorAtTrigger?: CodeMirror.Position

  public constructor() {
    this.show = false
    this.suggestions = []
    this.providers = [new LatexProvider()]
  }

  public isShown() {
    return this.show
  }

  public showView(editor: CodeMirror.Editor) {
    this.addKeybindings(editor)
    this.cursorAtTrigger = editor.getCursor()
    this.show = true
  }

  public removeView(editor: CodeMirror.Editor): void {
    this.show = false
    this.cursorAtTrigger = null

    this.addKeybindings(editor, false)
    this.destroyView(editor)
  }

  public getView(currentLine: string, editor: CodeMirror.Editor): HTMLElement | null {
    if (!this.show) return

    const text = this.completionWord(currentLine, editor.getCursor())

    let shouldRerender = false
    if (text !== this.currentText) {
      this.currentText = text
      shouldRerender = true

      this.suggestions = this.providers.reduce((acc, provider) =>
        acc.concat(provider.matchWith(text))
        , [])
      this.selectedIndex = 0
    }

    let cachedView = false
    if (!this.view || shouldRerender) {
      this.destroyView(editor)
      const view = this.generateView(this.suggestions)
      this.addClickListener(view, editor)

      this.view = view
    } else if (this.view.children &&
      this.view.children[0] &&
      this.view.children[0].children) {
      cachedView = true
      const children = this.view.children[0].children
      const selectedIndex = this.selectedIndex
      const selectedClass = 'is-selected'

      for (let index = 0; index < children.length; index++) {
        const child = children[index]
        const classes = child.classList

        if (index === selectedIndex) {
          if (!classes.contains(selectedClass))
            classes.add(selectedClass)
        } else if (classes.contains(selectedClass))
          classes.remove(selectedClass)
      }
    }

    return cachedView ? null : this.view
  }

  public viewRenderedCallback() {
    // TODO: How to manage click on list ? 
    // Add event listener to every line ?
    this.scrollToSelected()
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
          this.removeView(editor)
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

  // TODO: Refactor
  private addClickListener(view: HTMLElement, editor: CodeMirror.Editor, add = true) {
    if (!this.onClickCallback)
      this.onClickCallback = (event) => {
        const element = event.target as HTMLElement
        let hintId = element.id
        if (!hintId) {
          const parent = element.parentNode as HTMLElement
          if (parent && parent.id)
            hintId = parent.id
        }

        const hintIdPrefix = 'suggestion-'
        if (hintId && hintId.startsWith(hintIdPrefix)) {
          hintId = hintId.replace(hintIdPrefix, '')
          const id = parseInt(hintId)
          if (id && id > 0 && id < this.suggestions.length) {
            this.selectedIndex = id
            this.selectSuggestion(editor)
          }
        }
      }

    if (add)
      view.addEventListener('click', this.onClickCallback)
    else
      view.removeEventListener('click', this.onClickCallback)

    return view
  }

  private scrollToSelected() {
    // TODO: Improve scrolling behaviour
    const suggestion = document.getElementById(`suggestion-${this.selectedIndex}`)
    if (suggestion)
      suggestion.scrollIntoView()
  }

  public selectNext() {
    if (this.selectedIndex >= 0) {
      const increased = this.selectedIndex + 1
      this.selectedIndex = increased >= this.suggestions.length ? 0 : increased
    } else
      this.selectedIndex = 0
  }

  public selectPrevious() {
    if (this.selectedIndex >= 0) {
      const decreased = this.selectedIndex - 1
      this.selectedIndex = decreased < 0 ? this.suggestions.length - 1 : decreased
    } else
      this.selectedIndex = this.suggestions.length - 1
  }

  public selectSuggestion(editor: CodeMirror.Editor) {
    const cursor = editor.getCursor()
    const [selected, replaceFrom, replaceTo] = this.getSelectedAndPosition(cursor)
    editor.operation(() => {
      editor.replaceRange(selected, replaceFrom, replaceTo)

      const newCursorPosition = replaceFrom.ch + selected.length
      const updatedCursor = {
        line: cursor.line,
        ch: newCursorPosition
      }
      editor.setCursor(updatedCursor)
    })
    this.removeView(editor)
    editor.focus()
  }

  private getSelectedAndPosition(cursor: CodeMirror.Position): [string, CodeMirror.Position, CodeMirror.Position] {
    const textEndIndex = cursor.ch
    const updatedCursorFrom = {
      line: this.cursorAtTrigger.line,
      ch: this.cursorAtTrigger.ch
    }
    const updatedCursorTo = {
      line: this.cursorAtTrigger.line,
      ch: textEndIndex
    }

    const selected = this.suggestions[this.selectedIndex]

    return [selected.value, updatedCursorFrom, updatedCursorTo]
  }

  private destroyView(editor: CodeMirror.Editor) {
    if (!this.view) return

    this.addClickListener(this.view, editor, false)

    const parentNode = this.view.parentNode
    if (parentNode)
      parentNode.removeChild(this.view)
    this.view = null
  }

  private generateView(suggestions: Completion[]) {
    const suggestionsHtml = suggestions.map((tip: Completion, index) => {
      const isSelected = this.selectedIndex === index
      return `
        <div id="suggestion-${index}" class="no-space-wrap suggestion-item${isSelected ? ' is-selected' : ''}">
          <div id="suggestion-${index}" class="suggestion-content">
          <span class="suggestion-flair">${tip.category}</span>
          ${tip.value}
          </div>
        </div>
      `
    }, [])
    const viewString = `
      <div id="suggestion-list" class="suggestion">
        ${suggestionsHtml.join('\n')}
      </div>
      <div class="prompt-instructions">
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+N</span>
          <span>Next Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+P</span>
          <span>Previous Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Enter</span>
          <span>Select Suggestion</span>
        </div>
      </div>
    `
    const containerNode = document.createElement("div")
    if (suggestionsHtml.length > 0) {
      containerNode.addClass("suggestion-container")
      containerNode.insertAdjacentHTML('beforeend', viewString)
    }

    return containerNode
  }

  private completionWord(currentLine: string, cursor: CodeMirror.Position): string | null {
    const word = currentLine.substring(this.cursorAtTrigger.ch, cursor.ch)

    return word
  }
}
