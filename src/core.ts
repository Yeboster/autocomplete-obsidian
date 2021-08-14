import { Editor, Position } from "codemirror";
import { copyObject } from "./helpers/core";

export interface Completion {
  category: string;
  value: string;
}

class Core {
  // TODO: Add tokenizers
  protected readonly wordSeparatorPattern: RegExp;
  protected readonly trimPattern: RegExp;
  private cursorAtTrigger: Position;

  constructor(wordSeparators: string) {
    // TODO: Remove this when we have a tokenizer
    wordSeparators = `~?!@#$%^&*()-=+[{]}|;:' ",.<>/`;

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