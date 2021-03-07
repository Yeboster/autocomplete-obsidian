import { Provider } from './provider'

export class FlowProvider extends Provider {
  category = 'F'
  completions = []

  addCompletionWord(line: string, cursorIndex: number): void {
    const word = this.getLastWordFrom(line, cursorIndex)

    if (!word || this.alreadyAdded(word)) return

    this.completions.push(word)
  }

  private getLastWordFrom(line: string, cursorIndex: number): string | null {
    let wordStartIndex = cursorIndex
    const wordRegex = /[\w$]+/
    while (wordStartIndex && wordRegex.test(line.charAt(wordStartIndex - 1))) {
      wordStartIndex -= 1
    }

    let word: string | null = null
    if (wordStartIndex !== cursorIndex)
      word = line.slice(wordStartIndex, cursorIndex).trimRight()

    return word
  }

  private alreadyAdded(word: string): boolean {
    return this.completions.includes(word)
  }
}
