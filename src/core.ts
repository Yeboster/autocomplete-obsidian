import { Editor, Position } from "codemirror";
import { copyObject } from "./helpers/core";
import { TokenizerFactory } from "./providers/flow/factory";
import { Tokenizer } from "./providers/flow/tokenizer";
import { TokenizeStrategy } from "./tokenizer";

export interface Completion {
  category: string;
  value: string;
}

class Core {
  // TODO: Add tokenizers
  private readonly wordSeparatorPattern: RegExp;
  private readonly trimPattern: RegExp;
  private cursorAtTrigger: Position;
  private tokenizer: Tokenizer;


  constructor(strategy: TokenizeStrategy, wordSeparators: string) {
    // TODO: Remove this when we have a tokenizer
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

  isWordSeparator(char: string) {
    return this.wordSeparatorPattern.test(char);
  }
}

export default Core;