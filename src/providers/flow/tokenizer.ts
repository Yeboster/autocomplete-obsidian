export type TokenizeStrategy = 'default' | 'japanese' | 'arabic'
export const TOKENIZE_STRATEGIES: TokenizeStrategy[] = [
  'default',
  'japanese',
  'arabic',
]

export interface TokenizedResult {
  range?: Range
  tokens: string[]
}

export type Range = { start?: number; end?: number }
export type TokenizerOptions = { normalize: boolean }

export abstract class Tokenizer {
  protected readonly wordSeparatorPattern: RegExp = /[\[\]()<>"'.,|:; `!?\/]/
  protected readonly trimPattern: RegExp

  constructor() {
    // NOTE: global flag takes note of lastIndex used!
    this.trimPattern = new RegExp(this.wordSeparatorPattern, 'g')
  }

  abstract tokenize(text: string, range?: Range): TokenizedResult | undefined

  lastWordStartPos(
    text: string,
    index: number,
    options: TokenizerOptions = { normalize: false }
  ): number {
    const { normalized, updatedCursor } = options.normalize
      ? this.normalizedLine(text, index)
      : { normalized: text, updatedCursor: index }

    let wordStartIndex = updatedCursor
    while (
      wordStartIndex &&
      !this.isWordSeparator(normalized.charAt(wordStartIndex - 1))
    )
      wordStartIndex -= 1

    return wordStartIndex
  }

  lastWordFrom(
    text: string,
    cursorIndex: number,
    options: TokenizerOptions = { normalize: false }
  ): string | null {
    let wordStartIndex = this.lastWordStartPos(text, cursorIndex, options)
    let word: string | null = null
    if (wordStartIndex !== cursorIndex)
      word = text.slice(wordStartIndex, cursorIndex)

    return word
  }

  isWordSeparator(char: string) {
    return this.wordSeparatorPattern.test(char)
  }

  /*
   * Remove spaces and word separators
   * near the left of the cursorIndex
   */
  private normalizedLine(
    line: string,
    cursorIndex: number
  ): { normalized: string; updatedCursor: number } {
    const partialLine = line.slice(0, cursorIndex)
    let normalized = partialLine.trimEnd()

    // Subtract how many spaces removed
    let updatedCursor = cursorIndex - (partialLine.length - normalized.length)

    if (normalized.length === 0) return { normalized: '', updatedCursor: 0 }

    const lastChar = normalized.charAt(updatedCursor - 1)

    if (this.isWordSeparator(lastChar)) {
      updatedCursor -= 1
      normalized = normalized.slice(0, updatedCursor)
    }

    return { normalized, updatedCursor }
  }
}
