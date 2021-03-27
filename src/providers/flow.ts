import { lastWordFrom } from '../autocomplete/core'
import { TokenizeStrategy, tokenizeText } from './flow/tokenizer'
import { Provider } from './provider'

export class FlowProvider extends Provider {
  category = 'F'
  completions: string[] = []

  addLastWordFrom(line: string, cursorIndex: number): void {
    const { normalized, updatedCursor } = this.normalizedLine(line, cursorIndex)

    const word = lastWordFrom(normalized, updatedCursor)

    this.addWord(word)
  }

  addWordsFrom(text: string, strategy: TokenizeStrategy = 'default') {
    const result = tokenizeText(text, strategy)

    result.tokens.forEach((token) => this.addWord(token))
  }

  private addWord(word: string) {
    if (!word || this.alreadyAdded(word)) return

    this.completions.push(word)
  }

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

    if (Provider.wordSeparatorRegex.test(lastChar)) {
      updatedCursor -= 1
      normalized = normalized.slice(0, updatedCursor)
    }

    return { normalized, updatedCursor }
  }

  private alreadyAdded(word: string): boolean {
    return this.completions.includes(word)
  }
}
