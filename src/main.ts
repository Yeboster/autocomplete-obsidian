import { Editor } from "codemirror";
import { Plugin } from "obsidian";
import Core, { Store } from "./core";
import { isAutoTrigger, isTrigger } from "./helpers/core";
import View from "./view";
import { TokenizerFactory } from "./providers/flow/factory";

class AutocompletePlugin extends Plugin {
  private core: Core;
  private view: View;

  private editor: Editor;

  async load() {
    console.log('loading autocomplete plugin');

    // TODO: Settings
    // TODO: Status bar

    // TODO: Remove when settings are implemented
    const wordSeparatorPattern = `~?!@#$%^&*()-=+[{]}|;:' ",.<>/`;
    const tokenizer = TokenizerFactory.getTokenizer("default", wordSeparatorPattern);

    this.core = new Core("default", "");
    this.view = new View(this, tokenizer);

    this.registerCodeMirror((editor) => {
      editor.on('keyup', this.keyUpListener);
    });
  }

  async onload() {
    const workspace = this.app.workspace;
    // TODO: Remove status bar

    workspace.iterateCodeMirrors((editor) => {
      editor.off('keyup', this.keyUpListener);
      this.view.removeFrom(editor);
    });
  }

  /*
   * Listener used to trigger autocomplete
   */
  private keyUpListener = async (
    editor: CodeMirror.Editor,
    event: KeyboardEvent
  ) => {
    console.log(`keyup: ${event.code}`);

    if (this.editor !== editor) {
      this.view.removeFrom(this.editor, { resetCursorAtTrigger: true });
      this.editor = editor;
    }

    // TODO (?): Trigger like Vim autocomplete (ctrl+p/n)

    if (isTrigger(event)) {
      if (this.view.isShown())
        this.view.removeFrom(editor);
      else {
        this.asyncScanCurrentFile(editor);
        this.showAutocomplete(editor);
      }
    } else if (this.core.isWordSeparator(event.key)) {
      this.view.removeFrom(editor, { resetCursorAtTrigger: true });
    } else if (this.view.isShown())
      this.showAutocomplete(editor);
    else if (isAutoTrigger(editor, event, this.core.tokenizer)) {
      this.asyncScanCurrentFile(editor, { skipLastWord: true });
      this.showAutocomplete(editor);
    }
  };

  private showAutocomplete(editor: Editor) {
    const currentWord = this.core.wordUnderCursor(editor);
    const getSuggestions = () => this.core.search(currentWord);
    this.view.show({ editor, currentWord, getSuggestions });
  }

  private asyncScanCurrentFile(editor: Editor, options: { skipLastWord?: boolean; } = {}) {
    this.core.scanCurrentFile(this.app).then((store?: Store) => {
      if (store) {
        const getSuggestions = (query: string) => this.core.search(query, store);
        const currentWord = this.core.wordUnderCursor(editor, options);

        this.view.show({ editor, currentWord, getSuggestions });
      }
    });
  }
}

export default AutocompletePlugin;