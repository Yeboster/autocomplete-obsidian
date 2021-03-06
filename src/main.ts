import { MarkdownView, Notice, Plugin, TFile } from 'obsidian'
import { Autocomplete } from './autocomplete'
import {
  isAutoTrigger,
  isVimNormalMode,
  isVimTrigger,
} from './autocomplete/core'
import { TOKENIZE_STRATEGIES } from './providers/flow/tokenizer'
import { AutocompleteSettings } from './settings/settings'
import { AutocompleteSettingsTab } from './settings/settings-tab'
import { StatusBarView } from './statusbar'

export default class AutocompletePlugin extends Plugin {
  private autocomplete: Autocomplete
  private lastUsedEditor: CodeMirror.Editor
  private justTriggeredBy: 'vim' | 'autotrigger' | undefined

  private statusBar: StatusBarView

  settings: AutocompleteSettings

  async onload() {
    console.log('Loading Autocomplete plugin.')
    this.settings = Object.assign(
      new AutocompleteSettings(),
      await this.loadData()
    )
    this.addSettingTab(new AutocompleteSettingsTab(this.app, this))

    if (!this.settings.enabled) return

    this.statusBar = new StatusBarView(this, this.settings)
    this.enable()
    this.addCommands()
  }

  async onunload() {
    console.log('Unloaded Obsidian Autocomplete')
    this.disable()
  }

  async refresh() {
    this.disable()
    this.enable()
  }

  private addCommands() {
    this.addCommand({
      id: 'autocomplete-toggle',
      name: 'Toggle Autocomplete',
      hotkeys: [
        {
          modifiers: ['Ctrl'],
          key: ' ',
        },
      ],
      callback: () => {
        const autocomplete = this.autocomplete
        const editor = this.getValidEditorFor(autocomplete)

        if (editor) {
          // Do not open on vim normal mode
          if (isVimNormalMode(editor)) return

          autocomplete.toggleViewIn(editor)
        }
      },
    })

    this.addScanCommands()
  }

  enable() {
    this.autocomplete = new Autocomplete(this.settings)
    this.justTriggeredBy = undefined

    const settings = this.settings
    if (settings.flowProvider) this.statusBar.addStatusBar()
    if (settings.flowProviderScanCurrent) {
      this.app.workspace.on('file-open', this.onFileOpened, this)

      if (this.app.workspace.layoutReady) this.onLayoutReady()
      this.app.workspace.on('layout-ready', this.onLayoutReady, this)
    }

    this.registerCodeMirror((editor) => {
      editor.on('keydown', this.keyDownListener)
      editor.on('keyup', this.keyUpListener)
    })
  }

  disable() {
    const workspace = this.app.workspace
    // Always remove to avoid any kind problem
    workspace.off('file-open', this.onFileOpened)
    workspace.off('layout-ready', this.onLayoutReady)

    this.statusBar.removeStatusBar()

    workspace.iterateCodeMirrors((cm) => {
      cm.off('keyup', this.keyUpListener)
      cm.off('keydown', this.keyDownListener)
      this.autocomplete.removeViewFrom(cm)
    })
  }

  private addScanCommands() {
    TOKENIZE_STRATEGIES.forEach((type) => {
      const capitalized = type.replace(/^\w/, (c) => c.toLocaleUpperCase())
      const name = `Scan current file ${
        type !== 'default' ? `(${capitalized})` : ''
      }`

      this.addCommand({
        id: `autocomplete-scan-current-file-${type}`,
        name,
        callback: () => {
          if (!this.settings.flowProviderScanCurrent) {
            new Notice(
              'Please activate setting flow Provider: Scan current file'
            )
          }

          const autocomplete = this.autocomplete
          const editor = this.getValidEditorFor(autocomplete)

          if (editor) {
            const file = this.app.workspace.getActiveFile()
            autocomplete.scanFile(file, type)
          }
        },
      })
    })
  }

  /*
   * Listener used to trigger autocomplete
   * It intercepts inputs that could change the current line (e.g. ctrl+n)
   */
  private keyDownListener = (
    editor: CodeMirror.Editor,
    event: KeyboardEvent
  ) => {
    const autocomplete = this.autocomplete
    const settings = this.settings
    const autoSelect = settings.autoSelect

    if (
      autocomplete.isShown &&
      autocomplete.tokenizer.isWordSeparator(event.key)
    ) {
      this.autocomplete.removeViewFrom(editor)
      return
    } else if (autocomplete.isShown) return

    // Trigger like Vim autocomplete (ctrl+p/n)
    if (
      isVimTrigger({
        triggerLikeVim: settings.triggerLikeVim,
        editor,
        event,
      })
    ) {
      this.justTriggeredBy = 'vim'

      autocomplete.toggleViewIn(editor, {
        autoSelect,
        showEmptyMatch: !settings.autoTrigger,
      })

      if (event.key === 'p') autocomplete.selectLastSuggestion()
    } else if (isAutoTrigger(editor, event, autocomplete.tokenizer, settings)) {
      this.justTriggeredBy = 'autotrigger'

      autocomplete.toggleViewIn(editor, {
        autoSelect,
        showEmptyMatch: !settings.autoTrigger,
      })
    }
  }

  /*
   * Listener used to scan current word
   * Updates autocomplete results
   */
  private keyUpListener = (editor: CodeMirror.Editor, event: KeyboardEvent) => {
    const autocomplete = this.autocomplete
    autocomplete.updateProvidersFrom(event, editor)

    if (!autocomplete.isShown) return

    this.updateEditorIfChanged(editor, autocomplete)

    const settings = this.settings
    let updateSelected = true
    if (
      isVimTrigger({
        triggerLikeVim: settings.triggerLikeVim,
        editor,
        event,
      }) &&
      this.justTriggeredBy === 'vim'
    ) {
      // Do not update selected when there is vim trigger
      updateSelected = false
    }

    if (this.justTriggeredBy !== 'autotrigger')
      autocomplete.updateViewIn(editor, event, {
        updateSelected,
        autoSelect: settings.autoSelect,
        showEmptyMatch: !settings.autoTrigger,
      })

    if (this.justTriggeredBy) this.justTriggeredBy = undefined
  }

  private onLayoutReady() {
    const file = this.app.workspace.getActiveFile()
    if (file) this.autocomplete.scanFile(file)
  }

  private onFileOpened(file: TFile) {
    if (file) this.autocomplete.scanFile(file)
  }

  private getValidEditorFor(
    autocomplete: Autocomplete
  ): CodeMirror.Editor | null {
    const currentEditor = this.getCurrentEditor()

    if (currentEditor) this.updateEditorIfChanged(currentEditor, autocomplete)

    return currentEditor
  }

  private updateEditorIfChanged(
    editor: CodeMirror.Editor,
    autocomplete: Autocomplete
  ) {
    if (!this.lastUsedEditor) this.lastUsedEditor = editor

    if (editor !== this.lastUsedEditor) {
      autocomplete.removeViewFrom(this.lastUsedEditor)
      this.lastUsedEditor = editor
    }
  }

  private getCurrentEditor(): CodeMirror.Editor | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)

    return view ? view.sourceMode.cmEditor : null
  }
}
