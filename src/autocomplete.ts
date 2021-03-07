import { managePlaceholders } from './autocomplete/core'
import {
  Direction,
  defaultDirection,
  generateView,
  getRange,
  appendWidget,
  updateCachedView,
  scrollTo,
  completionWordIn,
} from './autocomplete/view'
import LatexProvider from './providers/latex'
import { Completion, Provider } from './providers/provider'
import { AutocompleteSettings } from './settings/settings'

export class Autocomplete {
  private providers: Provider[]
  private suggestions: Completion[]
  private selected: Direction

  private view: HTMLElement
  private cursorAtTrigger?: CodeMirror.Position
  private lastCompletionWord?: string
  private onClickCallback: (event: MouseEvent) => void

  private settings: AutocompleteSettings

  constructor(settings: AutocompleteSettings) {
    this.settings = settings
    this.loadProviders()
    this.suggestions = []
    this.selected = defaultDirection()
    this.view = null
  }

  public isShown(): boolean {
    return this.view !== null
  }

  public toggleViewIn(editor: CodeMirror.Editor) {
    const isEnabled = this.settings.enabled
    if (this.isShown() || !isEnabled) {
      this.cursorAtTrigger = null
      this.removeViewFrom(editor)
    } else if (isEnabled) {
      this.cursorAtTrigger = editor.getCursor()
      this.showViewIn(editor)
    }
  }

  public updateViewIn(editor: CodeMirror.Editor, event: KeyboardEvent) {
    this.changeSelectedSuggestionFrom(event)

    const completionWord = completionWordIn(editor, this.cursorAtTrigger)

    const recreate = completionWord !== this.lastCompletionWord
    if (recreate) {
      this.lastCompletionWord = completionWord
      this.showViewIn(editor, completionWord)
    } else updateCachedView(this.view, this.selected.index)

    scrollTo(this.selected, this.view, this.suggestions.length)
  }

  public removeViewFrom(editor: CodeMirror.Editor) {
    this.selected = defaultDirection()
    this.removeKeyBindings(editor)

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

  private showViewIn(editor: CodeMirror.Editor, completionWord: string = '') {
    if (this.view) this.removeViewFrom(editor)

    this.suggestions = this.providers.reduce(
      (acc, provider) => acc.concat(provider.matchWith(completionWord)),
      []
    )

    this.addKeyBindings(editor)

    this.view = generateView(this.suggestions, this.selected.index)
    this.addClickListener(this.view, editor)
    appendWidget(editor, this.view)
  }

  private changeSelectedSuggestionFrom(event: KeyboardEvent) {
    switch (`${event.ctrlKey} ${event.key}`) {
      case 'true p':
      case 'false ArrowUp':
        const decreased = this.selected.index - 1
        this.selected = {
          index: decreased < 0 ? this.suggestions.length - 1 : decreased,
          direction: 'backward',
        }
        break
      case 'true n':
      case 'false ArrowDown':
        const increased = this.selected.index + 1
        this.selected = {
          index: increased >= this.suggestions.length ? 0 : increased,
          direction: 'forward',
        }
        break
    }
  }

  private addKeyBindings(editor: CodeMirror.Editor) {
    editor.addKeyMap(this.keyMaps)
  }

  private removeKeyBindings(editor: CodeMirror.Editor) {
    editor.removeKeyMap(this.keyMaps)
  }

  private keyMaps = {
    // Override code mirror default key maps
    'Ctrl-P': () => {},
    'Ctrl-N': () => {},
    Down: () => {},
    Up: () => {},
    Enter: (editor: CodeMirror.Editor) => {
      this.selectSuggestion(editor)
    },
    Esc: (editor: CodeMirror.Editor) => {
      this.removeViewFrom(editor)
      if (editor.getOption('keyMap') === 'vim-insert')
        editor.operation(() => {
          // https://github.com/codemirror/CodeMirror/blob/bd37a96d362b8d92895d3960d569168ec39e4165/keymap/vim.js#L5341
          const vim = editor.state.vim
          vim.insertMode = false
          editor.setOption('keyMap', 'vim')
        })
    },
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
  }

  private selectSuggestion(editor: CodeMirror.Editor) {
    const cursor = editor.getCursor()
    const selectedValue = this.suggestions[this.selected.index].value

    // TODO: Convert to object
    const [replaceFrom, replaceTo] = getRange(this.cursorAtTrigger, cursor.ch)

    const { normalizedValue, newCursorPosition } = managePlaceholders(
      selectedValue,
      replaceFrom.ch
    )

    editor.operation(() => {
      editor.replaceRange(normalizedValue, replaceFrom, replaceTo)

      const updatedCursor = {
        line: cursor.line,
        ch: newCursorPosition,
      }
      editor.setCursor(updatedCursor)
    })
    // Need to remove it here because of focus
    this.removeViewFrom(editor)
    editor.focus()
  }

  private loadProviders() {
    const providers = []
    if (this.settings.latexProvider) providers.push(new LatexProvider())

    this.providers = providers
  }
}
