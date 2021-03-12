import {getLastWordFrom} from '../autocomplete/core'
import { Provider } from './provider'

export class FlowProvider extends Provider {
  category = 'F'
  completions = []

  addCompletionWord(line: string, cursorIndex: number): void {
    const { normalized, updatedCursor } = this.normalizedLine(line, cursorIndex)

    const word = getLastWordFrom(normalized, updatedCursor)

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
