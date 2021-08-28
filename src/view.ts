import { Editor } from "codemirror";
import { Completion } from "./core";
import { copyObject } from "./helpers/core";
import { appendWidget, ClickListenerOptions, defaultDirection, Direction, generateView, managePlaceholders, scrollTo, updateCachedView, updateSelectedSuggestionFrom, UpdateOptions, extractCursorAtTrigger } from "./helpers/view";
import AutocompletePlugin from "./main";
import { Tokenizer } from "./providers/flow/tokenizer";
class View {
  private selected: Direction;
  private lastCompletionWord: string = '';
  private view?: HTMLElement;
  private cursorAtTrigger?: CodeMirror.Position;
  private suggestions?: Completion[];

  private plugin: AutocompletePlugin;
  private tokenizer: Tokenizer;

  // TODO: Remove view if editor has changed, else update view

  constructor(plugin: AutocompletePlugin, tokenizer: Tokenizer) {
    this.selected = defaultDirection();
    this.plugin = plugin;
    this.tokenizer = tokenizer;
  }

  private onClickCallback: (event: MouseEvent) => void;

  public isShown(): boolean {
    return this.view != null;
  }

  public show(editor: Editor, results: Completion[]) {
    // TODO: Remove this line when updating view
    if (this.isShown()) this.removeFrom(editor);

    console.log("Cursor at trigger", this.cursorAtTrigger);

    this.suggestions = results;
    if (!this.cursorAtTrigger)
      this.cursorAtTrigger = extractCursorAtTrigger(editor, this.tokenizer);

    editor.addKeyMap(this.autocompleteKeymap);

    // TODO: Update the view here if it already exists

    this.view = generateView(results, 0);
    this.addClickListener({ view: this.view, editor });
    // TODO: Use appendListWidget
    appendWidget(editor, this.view);
  }

  public removeFrom(editor: Editor, { resetCursorAtTrigger } = { resetCursorAtTrigger: false }) {
    if (!this.isShown()) return;

    if (resetCursorAtTrigger) this.cursorAtTrigger = null;
    editor.removeKeyMap(this.autocompleteKeymap);
    this.addClickListener({ view: this.view, editor, remove: true });
    this.selected = defaultDirection();

    try {
      const parentNode = this.view.parentNode;
      if (parentNode) {
        const removed = parentNode.removeChild(this.view);
        if (removed) this.view = null;
      }
    } catch (e) {
      console.error(`Cannot destroy view. Reason: ${e}`);
    }
  }

  public update(options: UpdateOptions): void {
    const { editor, currentWord, getSuggestions } = options;

    if (currentWord !== this.lastCompletionWord) {
      this.removeFrom(editor);
      this.lastCompletionWord = currentWord;
      this.suggestions = getSuggestions(currentWord);
      this.show(editor, this.suggestions);
    } else {
      // Update selected item if changed in event
      if (this.suggestions && options.event)
        this.selected = updateSelectedSuggestionFrom(
          options.event,
          this.selected,
          this.suggestions.length
        );
      updateCachedView(this.view, this.selected.index);
    }

    scrollTo(this.selected, this.view, this.suggestions.length);
  }

  private autocompleteKeymap = {
    // Override code mirror default key maps
    'Ctrl-P': () => { },
    'Ctrl-N': () => { },
    Up: () => { },
    Down: () => { },
    Right: (editor: Editor) => this.removeFrom(editor, { resetCursorAtTrigger: true }),
    Left: (editor: Editor) => this.removeFrom(editor, { resetCursorAtTrigger: true }),
    Tab: (editor: Editor) => {
      this.selectSuggestion(editor);
    },
    Enter: (editor: Editor) => {
      this.selectSuggestion(editor);
    },
    Esc: (editor: Editor) => {
      this.removeFrom(editor, { resetCursorAtTrigger: true });
      if (editor.getOption('keyMap') === 'vim-insert')
        editor.operation(() => {
          // https://github.com/codemirror/CodeMirror/blob/bd37a96d362b8d92895d3960d569168ec39e4165/keymap/vim.js#L5341
          const vim = editor.state.vim;
          vim.insertMode = false;
          editor.setOption('keyMap', 'vim');
        });
    },
  };

  private addClickListener(
    {
      view,
      editor,
      remove = false
    }: ClickListenerOptions
  ) {
    if (!this.onClickCallback)
      this.onClickCallback = (event) => {
        const element = event.target as HTMLElement;
        let hintId = element.id;
        if (!hintId) {
          const parent = element.parentNode as HTMLElement;
          if (parent && parent.id) hintId = parent.id;
        }

        const hintIdPrefix = 'suggestion-';
        if (hintId && hintId.startsWith(hintIdPrefix)) {
          hintId = hintId.replace(hintIdPrefix, '');
          const id = parseInt(hintId);
          if (id >= 0 && id < this.suggestions.length) {
            this.selected.index = id;
            this.selectSuggestion(editor);
          }
        }
      };

    if (remove) {
      view.removeEventListener('click', this.onClickCallback);
      this.onClickCallback = null;
    } else {
      this.plugin.registerDomEvent(view, 'click', this.onClickCallback);
    }
  }

  private selectSuggestion(editor: Editor) {
    const cursor = editor.getCursor();
    const selectedValue = this.suggestions[this.selected.index]?.value;

    if (!selectedValue) {
      this.removeFrom(editor, { resetCursorAtTrigger: true });
      return;
    }

    const { normalizedValue, newCursorPosition } = managePlaceholders(
      selectedValue,
      this.cursorAtTrigger!.ch
    );

    editor.replaceRange(normalizedValue, this.cursorAtTrigger, cursor);

    const updatedCursor = {
      line: cursor.line,
      ch: newCursorPosition,
    };
    editor.setCursor(updatedCursor);
    this.removeFrom(editor, { resetCursorAtTrigger: true });
    editor.focus();
  }

}

export default View;