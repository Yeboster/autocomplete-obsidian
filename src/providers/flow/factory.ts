import { TokenizeStrategy, Tokenizer } from './tokenizer'
import { ArabicTokenizer } from './tokenizer/arabic'
import { DefaultTokenizer } from './tokenizer/default'
import { JapaneseTokenizer } from './tokenizer/japanese'

export class TokenizerFactory {
  static getTokenizer(strategy: TokenizeStrategy): Tokenizer {
    let tokenizer: Tokenizer
    switch (strategy) {
      case 'default':
        tokenizer = new DefaultTokenizer()
        break

      case 'japanese':
        tokenizer = new JapaneseTokenizer()
        break
      case 'arabic':
        tokenizer = new ArabicTokenizer()
        break

      default:
        throw new Error(`Strategy '${strategy}' not found`)
    }

    return tokenizer
  }
}
