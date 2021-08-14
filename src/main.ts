import { Editor } from "codemirror";
import { randomBytes } from "crypto";
import { Plugin } from "obsidian";
import Core from "./core";
import View from "./view";
import searchWorker from './workers/search';

class AutocompletePlugin extends Plugin {
  // TODO: Use indexedDB
  private store = [
    {
      category: 'F',
      value: "hello"
    },
    {
      category: 'F',
      value: "there"
    },
  ];
  private core: Core;
  private view: View;

  async load() {
    console.log('loading autocomplete plugin');
    console.log(`VER: ${randomBytes(4).toString('hex')}`);

    // TODO: Settings
    // TODO: Status bar

    this.core = new Core("");
    this.view = new View();

    searchWorker.search(this.store, 'hello there').then(result => {
      console.log(result);
    });

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
    console.log('clicked', event.key);

    // TODO: Remove if word separator
    if (this.view.isShown() && this.core.isWordSeparator(event.key)) {
      console.log('removing view...');

      this.view.remove(editor);
      return;
    } else {
      console.log('showing view...');
      const currentWord = this.core.wordUnderCursor(editor);
      const completions = await searchWorker.search(this.store, currentWord);
      this.view.show(editor, completions);
    }

    // TODO (?): Trigger like Vim autocomplete (ctrl+p/n)
    // TODO: Autotrigger
  };
}

export default AutocompletePlugin;