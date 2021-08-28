import { time, timeEnd } from "console";
import { Editor as IEditor } from "codemirror";
import { Editor, MarkdownEditView, Plugin } from "obsidian";
import Core, { Store } from "./core";
import { isAutoTrigger, isTrigger } from "./helpers/core";
import View from "./view";
import { TokenizerFactory } from "./providers/flow/factory";

class AutocompletePlugin extends Plugin {
  private core: Core;
  private view: View;

  private editor: IEditor;

  async load() {
    console.log('loading autocomplete plugin');

    // TODO: Settings
    // TODO: Status bar

    // TODO: Remove when settings are implemented
    const wordSeparatorPattern = `~?!@#$%^&*()-=+[{]}|;:' ",.<>/`;
    const tokenizer = TokenizerFactory.getTokenizer("default", wordSeparatorPattern)

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
      else
        this.scanAndShowAutocomplete(editor);
    } else if (this.view.isShown()) {
      if (this.core.isWordSeparator(event.key))
        this.view.removeFrom(editor);
      else
        this.updateAutocomplete(editor, event);
    } else if (isAutoTrigger(editor, event, this.core.tokenizer))
      // TODO: When auto triggering, trigger on beginning of word
      this.scanAndShowAutocomplete(editor);
  };

  private scanAndShowAutocomplete(editor: IEditor) {
    const currentWord = this.core.wordUnderCursor(editor);

    this.scanCurrentFileWithCallback(editor);

    const completions = this.core.search(currentWord);
    this.view.show(editor, completions);
  }

  private scanCurrentFileWithCallback(editor: IEditor) {
    // TODO: Use observable to update view
    this.core.scanCurrentFile(this.app).then((store: Store) => {
      if (store) {
        const getSuggestions = (query: string) => this.core.search(query, store);
        const currentWord = this.core.wordUnderCursor(editor);

        if (this.view.isShown()) {
          this.view.update({ editor, currentWord, getSuggestions });
        } else {
          const completions = getSuggestions(currentWord);
          this.view.show(editor, completions);
        }
      }
    });;
  }

  private updateAutocomplete(editor: IEditor, event: KeyboardEvent) {
    // TODO: How frequently scan the file?
    this.scanCurrentFileWithCallback(editor);

    const currentWord = this.core.wordUnderCursor(editor);
    const getSuggestions = (query: string) => this.core.search(query);
    this.view.update({ editor, currentWord, event, getSuggestions });
  }
}

export default AutocompletePlugin;