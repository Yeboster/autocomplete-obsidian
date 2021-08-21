import { Editor } from "codemirror";
import { Plugin } from "obsidian";
import Core from "./core";
import View from "./view";

class AutocompletePlugin extends Plugin {
  private core: Core;
  private view: View;

  async load() {
    console.log('loading autocomplete plugin');

    // TODO: Settings
    // TODO: Status bar

    this.core = new Core("default", "");
    this.view = new View();

    this.registerCodeMirror((editor) => {
      editor.on('keyup', this.keyUpListener);
    });
  }

  async onload() {
    const workspace = this.app.workspace;
    // TODO: Remove status bar

    workspace.iterateCodeMirrors((editor) => {
      editor.off('keyup', this.keyUpListener);
      this.view.remove(editor);
    });
  }

  /*
   * Listener used to trigger autocomplete
   */
  private keyUpListener = async (
    editor: Editor,
    event: KeyboardEvent
  ) => {
    if (this.view.isShown() && this.core.isWordSeparator(event.key)) {
      this.view.remove(editor);
      return;
    } else {
      // TODO: Use observable to update view
      this.core.scanCurrentFile(this.app);

      const currentWord = this.core.wordUnderCursor(editor);
      const completions = this.core.matchAll(this.core.store, currentWord);
      this.view.show(editor, completions);
    }

    // TODO (?): Trigger like Vim autocomplete (ctrl+p/n)
    // TODO: Autotrigger
  };
}

export default AutocompletePlugin;