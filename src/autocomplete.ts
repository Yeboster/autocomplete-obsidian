import {
  Direction,
  defaultDirection,
  managePlaceholders,
  updateSelectedSuggestionFrom,
  copyObject,
} from './autocomplete/core'
import {
  generateView,
  appendWidget,
  updateCachedView,
  scrollTo,
} from './autocomplete/view'

import { FlowProvider } from './providers/flow'
import { TokenizeStrategy } from './providers/flow/tokenizer'
import { TokenizerFactory } from './providers/flow/factory'
import LaTexProvider from './providers/latex'
import { Completion, Provider } from './providers/provider'

import { AutocompleteSettings } from './settings/settings'

import { TFile } from 'obsidian'

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

  public get isShown(): boolean {
    return this.view !== null
  }

  public toggleViewIn(editor: CodeMirror.Editor) {
    const isEnabled = this.settings.enabled
    if (this.isShown || !isEnabled) {
      this.cursorAtTrigger = null
      this.removeViewFrom(editor)
    } else if (isEnabled) {
      const cursor = copyObject(editor.getCursor())
      const currentLine: string = editor.getLine(cursor.line)

      const wordStartIndex = this.tokenizer.lastWordStartPos(
        currentLine,
        cursor.ch
      )
      const cursorAt = cursor.ch
      cursor.ch = wordStartIndex
      this.cursorAtTrigger = cursor

      const word = currentLine.slice(wordStartIndex, cursorAt)

      this.showViewIn(editor, word)
    }
  }

  public updateViewIn(editor: CodeMirror.Editor, event: KeyboardEvent) {
    if (!event.ctrlKey && event.key === ' ') return this.removeViewFrom(editor)

    this.selected = updateSelectedSuggestionFrom(
      event,
      this.selected,
      this.suggestions.length
    )

    const cursor = copyObject(editor.getCursor())
    const currentLine: string = editor.getLine(cursor.line)
    const completionWord = this.tokenizer.lastWordFrom(currentLine, cursor.ch)

    const recreate = completionWord !== this.lastCompletionWord
    if (recreate) {
      this.lastCompletionWord = completionWord
      this.showViewIn(editor, completionWord)
    } else updateCachedView(this.view, this.selected.index)

    scrollTo(this.selected, this.view, this.suggestions.length)
  }

  public removeViewFrom(editor: CodeMirror.Editor) {
    this.selected = defaultDirection()
    editor.removeKeyMap(this.keyMaps)

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

  public updateProvidersFrom(event: KeyboardEvent, editor: CodeMirror.Editor) {
    const tokenizer = TokenizerFactory.getTokenizer(
      this.settings.flowProviderTokenizeStrategy
    )
    if (
      !event.ctrlKey &&
      (tokenizer.isWordSeparator(event.key) || event.key === 'Enter')
    ) {
      const cursor = copyObject(editor.getCursor())
      if (/Enter/.test(event.key)) {
        cursor.line -= 1
        const currentLine = editor.getLine(cursor.line)

        // Changed editor pane
        if (!currentLine) return

        cursor.ch = currentLine.length
      }
      const line = editor.getLine(cursor.line)
      this.providers.forEach((provider) => {
        // For now only FlowProvider
        if (provider instanceof FlowProvider)
          provider.addLastWordFrom(line, cursor.ch, this.tokenizerStrategy)
      })
    }
  }

  public scanFile(file: TFile, strategy: TokenizeStrategy = 'default') {
    const providers = this.providers
    file.vault?.read(file).then((content: string) => {
      // TODO: Make it async
      providers.forEach((provider) => {
        if (provider instanceof FlowProvider)
          provider.addWordsFrom(content, strategy)
      })
    })
  }

  private get tokenizer() {
    return TokenizerFactory.getTokenizer(this.tokenizerStrategy)
  }

  private get tokenizerStrategy() {
    return this.settings.flowProviderTokenizeStrategy
  }

  private showViewIn(editor: CodeMirror.Editor, completionWord: string = '') {
    if (this.view) this.removeViewFrom(editor)

    this.suggestions = this.providers.reduce(
      (acc, provider) => acc.concat(provider.matchWith(completionWord || '')),
      []
    )

    editor.addKeyMap(this.keyMaps)

    this.view = generateView(this.suggestions, this.selected.index)
    this.addClickListener(this.view, editor)
    appendWidget(editor, this.view)
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
          if (id >= 0 && id < this.suggestions.length) {
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
    const selectedValue = this.suggestions[this.selected.index]?.value

    if (!selectedValue) {
      this.removeViewFrom(editor)
      return
    }

    const { normalizedValue, newCursorPosition } = managePlaceholders(
      selectedValue,
      this.cursorAtTrigger!.ch
    )

    editor.operation(() => {
      editor.replaceRange(normalizedValue, this.cursorAtTrigger, cursor)

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
    if (this.settings.flowProvider) providers.push(new FlowProvider())
    if (this.settings.latexProvider) providers.push(new LaTexProvider())

    this.providers = providers
  }
}
