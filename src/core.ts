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
  private readonly tokenizer: Tokenizer;
  private cursorAtTrigger: Position;

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

  public wordUnderCursor(editor: Editor) {
    const cursor = copyObject(editor.getCursor());
    const currentLine: string = editor.getLine(cursor.line);

    const wordStartIndex = this.wordUnderCursorPos(
      currentLine,
      cursor.ch
    );
    const cursorAt = cursor.ch;
    cursor.ch = wordStartIndex;
    this.cursorAtTrigger = cursor;

    const word = currentLine.slice(wordStartIndex, cursorAt);

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
    let scanned = false;

    if (current.extension === "md") {
      console.log("Scanning current file...");
      const content = await app.vault.read(current);
      const res = await scanWorker.scan({ store: this.store, text: content, tokenizer: this.tokenizer });
      this.store = res;
      scanned = true;
    }

    return scanned;
  }

  public matchAll(store: Completion[], query: string): Completion[] {
    const inputLowered = query.toLowerCase();
    const inputHasUpperCase = /[A-Z]/.test(query);

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