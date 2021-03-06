import { Completion, Provider } from './providers/provider'
import LatexProvider from './providers/latex'
import { AutocompleteSettings } from './settings/settings'

// TODO: Refactor business logic into module
export default class AutocompleteView {
  private view: HTMLElement
  private show: boolean
  private keymaps: CodeMirror.KeyMap
  private onClickCallback: (event: MouseEvent) => void
  private providers: Provider[]
  private suggestions: Completion[]
  private selected: {
    index: number
    direction: 'forward' | 'backward' | 'still'
  }
  private currentText?: string
  private cursorAtTrigger?: CodeMirror.Position

  private settings: AutocompleteSettings

  public constructor(settings: AutocompleteSettings) {
    this.settings = settings
    this.show = false
    this.suggestions = []
    this.selected = { index: 0, direction: 'still' }
    this.loadProviders()
  }

  public loadProviders() {
    const providers = []
    if (this.settings.latexProvider) providers.push(new LatexProvider())

    this.providers = providers
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
    this.selected = { index: 0, direction: 'still' }

    this.addKeybindings(editor, false)
    this.destroyView(editor)
  }

  public getView(
    currentLine: string,
    editor: CodeMirror.Editor
  ): HTMLElement | null {
    if (!this.show) return

    const text = this.completionWord(currentLine, editor.getCursor())

    let shouldRerender = false
    if (text !== this.currentText) {
      this.currentText = text
      shouldRerender = true

      this.suggestions = this.providers.reduce(
        (acc, provider) => acc.concat(provider.matchWith(text)),
        []
      )
      this.selected = { index: 0, direction: 'still' }
    }

    let cachedView = false
    if (!this.view || shouldRerender) {
      this.destroyView(editor)
      const view = this.generateView(this.suggestions)
      this.addClickListener(view, editor)

      this.view = view
    } else if (this.view.firstElementChild) {
      cachedView = true
      const children = this.view.firstElementChild.children
      const selectedIndex = this.selected.index

      for (let index = 0; index < children.length; index++) {
        const child = children[index]
        child.toggleClass('is-selected', index === selectedIndex)
      }
    }

    return cachedView ? null : this.view
  }

  public scrollToSelected() {
    if (!this.view || this.suggestions.length === 0) return

    // TODO: Improve scrolling with page size and boundaries

    const parent = this.view.children[0]
    const selectedIndex = this.selected.index
    const child = parent.children[0]
    if (child) {
      let scrollAmount = child.scrollHeight * selectedIndex

      switch (this.selected.direction) {
        case 'forward':
          if (selectedIndex === 0)
            // End -> Start
            parent.scrollTop = 0
          else parent.scrollTop = scrollAmount
          break
        case 'backward':
          if (selectedIndex === this.suggestions.length - 1)
            // End <- Start
            parent.scrollTop = parent.scrollHeight
          else parent.scrollTop = scrollAmount
          break
      }
    }
  }

  public selectNext() {
    const increased = this.selected.index + 1
    this.selected = {
      index: increased >= this.suggestions.length ? 0 : increased,
      direction: 'forward',
    }
  }

  public selectPrevious() {
    const decreased = this.selected.index - 1
    this.selected = {
      index: decreased < 0 ? this.suggestions.length - 1 : decreased,
      direction: 'backward',
    }
  }

  public selectSuggestion(editor: CodeMirror.Editor) {
    const cursor = editor.getCursor()
    const [selected, replaceFrom, replaceTo] = this.getSelectedAndPosition(
      cursor
    )
    editor.operation(() => {
      editor.replaceRange(selected, replaceFrom, replaceTo)

      const newCursorPosition = replaceFrom.ch + selected.length
      const updatedCursor = {
        line: cursor.line,
        ch: newCursorPosition,
      }
      editor.setCursor(updatedCursor)
    })
    this.removeView(editor)
    editor.focus()
  }

  private addKeybindings(editor: CodeMirror.Editor, add = true) {
    if (!this.keymaps)
      this.keymaps = {
        // Override keymaps but manage them into "keyup" event
        // Because need to update selectedIndex right before updating view
        'Ctrl-P': () => {},
        'Ctrl-N': () => {},
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
            editor.operation(() => {
              // https://github.com/codemirror/CodeMirror/blob/bd37a96d362b8d92895d3960d569168ec39e4165/keymap/vim.js#L5341
              const vim = editor.state.vim
              vim.insertMode = false
              editor.setOption('keyMap', 'vim')
            })
        },
      }

    if (add) editor.addKeyMap(this.keymaps)
    // Remove needs object reference
    else editor.removeKeyMap(this.keymaps)
  }

  // TODO: Refactor
  private addClickListener(
    view: HTMLElement,
    editor: CodeMirror.Editor,
    add = true
  ) {
    if (!this.onClickCallback)
      this.onClickCallback = (event) => {
        const element = event.target as HTMLElement
        let hintId = element.id
        if (!hintId) {
          const parent = element.parentNode as HTMLElement
          if (parent && parent.id) hintId = parent.id
        }

        const hintIdPrefix = 'suggestion-'
        if (hintId && hintId.startsWith(hintIdPrefix)) {
          hintId = hintId.replace(hintIdPrefix, '')
          const id = parseInt(hintId)
          if (id && id > 0 && id < this.suggestions.length) {
            this.selected.index = id
            this.selectSuggestion(editor)
          }
        }
      }

    if (add) view.addEventListener('click', this.onClickCallback)
    else view.removeEventListener('click', this.onClickCallback)

    return view
  }

  private getSelectedAndPosition(
    cursor: CodeMirror.Position
  ): [string, CodeMirror.Position, CodeMirror.Position] {
    const textEndIndex = cursor.ch
    const updatedCursorFrom = {
      line: this.cursorAtTrigger.line,
      ch: this.cursorAtTrigger.ch,
    }
    const updatedCursorTo = {
      line: this.cursorAtTrigger.line,
      ch: textEndIndex,
    }

    const selected = this.suggestions[this.selected.index]

    return [selected.value, updatedCursorFrom, updatedCursorTo]
  }

  private destroyView(editor: CodeMirror.Editor) {
    if (!this.view) return

    this.addClickListener(this.view, editor, false)

    try {
      const parentNode = this.view.parentNode
      if (parentNode) {
        const removed = parentNode.removeChild(this.view)
        if (removed) this.view = null
      }
    } catch (e) {
      console.error(`Cannot destroy view. Reason: ${e}`)
    }
  }

  private generateView(suggestions: Completion[]) {
    const selectedIndex = this.selected.index
    const suggestionsHtml = suggestions.map((tip: Completion, index) => {
      const isSelected = selectedIndex === index
      return `
        <div id="suggestion-${index}" class="no-space-wrap suggestion-item${
        isSelected ? ' is-selected' : ''
      }">
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
    const containerNode = document.createElement('div')
    if (suggestionsHtml.length > 0) {
      containerNode.addClass('suggestion-container')
      containerNode.insertAdjacentHTML('beforeend', viewString)
    }

    return containerNode
  }

  private completionWord(
    currentLine: string,
    cursor: CodeMirror.Position
  ): string | null {
    const word = currentLine.substring(this.cursorAtTrigger.ch, cursor.ch)

    return word
  }
}
