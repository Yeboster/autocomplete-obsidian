import { Editor, Position } from "codemirror";
import { App } from "obsidian";
import { copyObject } from "./helpers/core";
import { TokenizerFactory } from "./providers/flow/factory";
import { Tokenizer } from "./providers/flow/tokenizer";
import { TokenizeStrategy } from "./providers/flow/tokenizer";

import scanWorker from './workers/scan';

export interface Completion {
  category: string;
  value: string;
}

export type Store = Completion[];

class Core {
  private readonly wordSeparatorPattern: RegExp;
  private readonly trimPattern: RegExp;

  tokenizer: Tokenizer;
  store: Store;

  constructor(strategy: TokenizeStrategy, wordSeparators: string) {
    // TODO: Use indexedDB
    this.store = [];

    // TODO: Remove this when we have settings
    wordSeparators = `~?!@#$%^&*()-=+[{]}|;:' ",.<>/`;
    this.tokenizer = TokenizerFactory.getTokenizer(strategy, wordSeparators);

    const escapedSeparators = wordSeparators.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.wordSeparatorPattern = new RegExp(`[${escapedSeparators}]`);

    // NOTE: global flag takes note of lastIndex used!
    this.trimPattern = new RegExp(this.wordSeparatorPattern, 'g');
  }

  public wordUnderCursor(editor: Editor, options: { skipLastWord?: boolean; } = { skipLastWord: false }) {
    const cursor = copyObject(editor.getCursor());
    const currentLine: string = editor.getLine(cursor.line);

    let wordStartPos = this.wordUnderCursorPos(currentLine, cursor.ch);
    if (options.skipLastWord) {
      // Do it again to skip last word
      const skippedWordPos = wordStartPos - 1;
      wordStartPos = this.wordUnderCursorPos(currentLine, skippedWordPos);
    }

    const cursorAt = cursor.ch;
    cursor.ch = wordStartPos;

    const word = currentLine.slice(wordStartPos, cursorAt);

    return word;
  }

  public wordUnderCursorPos(text: string, index: number) {
    let wordStartIndex = index;
    while (
      wordStartIndex &&
      !this.isWordSeparator(text.charAt(wordStartIndex - 1))
    )
      wordStartIndex -= 1;

    return wordStartIndex;
  }

  public isWordSeparator(char: string) {
    return this.wordSeparatorPattern.test(char);
  }

  public async scanCurrentFile(app: App) {
    const current = app.workspace.getActiveFile();
    let scanned = null;

    if (current.extension === "md") {
      const content = await app.vault.read(current);
      const store = await scanWorker.scan({ store: this.store, text: content, tokenizer: this.tokenizer });
      this.store = store;
      scanned = store;
    }

    return scanned;
  }

  public search(query: string, store: Store | Completion[] = null): Completion[] {
    const inputLowered = query.toLowerCase();
    const inputHasUpperCase = /[A-Z]/.test(query);

    if (store === null)
      store = this.store;

    // case-sensitive logic if input has an upper case.
    // Otherwise, uses case-insensitive logic
    const suggestions = store
      .filter((suggestion) => {
        const value = suggestion.value;
        return value !== query
          ? inputHasUpperCase
            ? value.includes(query)
            : value.toLowerCase().includes(inputLowered)
          : false;
      })
      .sort(({ value: a }, { value: b }) => a.localeCompare(b))
      .sort(
        ({ value: a }, { value: b }) =>
          Number(b.toLowerCase().startsWith(inputLowered)) -
          Number(a.toLowerCase().startsWith(inputLowered))
      )
      .map((suggestion) => {
        return { category: suggestion.category, value: suggestion.value };
      });

    return suggestions;
  };

}

export default Core;