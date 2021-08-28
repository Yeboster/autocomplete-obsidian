export type TokenizeStrategy = 'default' | 'japanese' | 'arabic';
export const TOKENIZE_STRATEGIES: TokenizeStrategy[] = [
  'default',
  'japanese',
  'arabic',
];

export interface TokenizedResult {
  range?: Range;
  tokens: string[];
}

export type Range = { start?: number; end?: number; };
export type TokenizerOptions = { normalize: boolean; };

export abstract class Tokenizer {
  protected readonly wordSeparatorPattern: RegExp;
  protected readonly trimPattern: RegExp;

  type: TokenizeStrategy = 'default';
  wordSeparators: string;

  constructor(wordSeparators: string) {
    this.wordSeparators = wordSeparators;

    const escapedSeparators = wordSeparators.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    this.wordSeparatorPattern = new RegExp(`[${escapedSeparators}]`);

    // NOTE: global flag takes note of lastIndex used!
    this.trimPattern = new RegExp(this.wordSeparatorPattern, 'g');
  }

  abstract tokenize(text: string, range?: Range): TokenizedResult | undefined;

  lastWordStartPos(
    text: string,
    offset: number,
  ): number {
    let wordStartIndex = offset;
    while (
      wordStartIndex &&
      !this.isWordSeparator(text.charAt(wordStartIndex - 1))
    )
      wordStartIndex -= 1;

    return wordStartIndex;
  }

  lastWordFrom(
    text: string,
    cursorIndex: number,
  ): string | null {
    let wordStartIndex = this.lastWordStartPos(
      text,
      cursorIndex
    );
    let word: string | null = null;
    if (wordStartIndex !== cursorIndex)
      word = text.slice(wordStartIndex, cursorIndex);

    return word;
  }

  isWordSeparator(char: string) {
    return this.wordSeparatorPattern.test(char);
  }
}
