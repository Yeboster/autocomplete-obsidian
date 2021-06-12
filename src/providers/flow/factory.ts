import { TokenizeStrategy, Tokenizer } from './tokenizer'
import { ArabicTokenizer } from './tokenizer/arabic'
import { DefaultTokenizer } from './tokenizer/default'
import { JapaneseTokenizer } from './tokenizer/japanese'

export class TokenizerFactory {
  static getTokenizer(strategy: TokenizeStrategy, wordSeparators: string): Tokenizer {
    let tokenizer: Tokenizer
    switch (strategy) {
      case 'default':
        tokenizer = new DefaultTokenizer(wordSeparators)
        break

      case 'japanese':
        tokenizer = new JapaneseTokenizer(wordSeparators)
        break
      case 'arabic':
        tokenizer = new ArabicTokenizer(wordSeparators)
        break

      default:
        throw new Error(`Strategy '${strategy}' not found`)
    }

    return tokenizer
  }
}
