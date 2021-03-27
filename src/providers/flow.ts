import { TokenizerFactory } from './flow/factory'
import { TokenizeStrategy } from './flow/tokenizer'
import { Provider } from './provider'

export class FlowProvider extends Provider {
  category = 'F'
  completions: string[] = []

  addLastWordFrom(
    line: string,
    cursorIndex: number,
    strategy: TokenizeStrategy
  ): void {
    const word = TokenizerFactory.getTokenizer(strategy).lastWordFrom(
      line,
      cursorIndex,
      { normalize: true }
    )

    this.addWord(word)
  }

  addWordsFrom(text: string, strategy: TokenizeStrategy = 'default') {
    const result = TokenizerFactory.getTokenizer(strategy).tokenize(text)

    result.tokens.forEach((token) => this.addWord(token))
  }

  private addWord(word: string) {
    if (!word || this.alreadyAdded(word)) return

    this.completions.push(word)
  }

  private alreadyAdded(word: string): boolean {
    return this.completions.includes(word)
  }
}
