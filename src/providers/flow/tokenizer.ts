import { ArabicTokenizer } from './tokenizer/arabic'
import { DefaultTokenizer } from './tokenizer/default'
import { JapaneseTokenizer } from './tokenizer/japanese'

export const TRIM_CHAR_PATTERN = /[\[\]()<>"'.,|:; `!?\/]/g
export const ARABIC_TRIM_CHAR_PATTERN = /[\[\]()<>"'.,|; `،؛]/g

export type TokenizeStrategy = 'default' | 'japanese' | 'arabic'
export const TOKENIZE_STRATEGIES: TokenizeStrategy[] =  ['default', 'japanese', 'arabic']

// TODO: Should logic be uniformed with current word tokenization ?
export interface TokenizedResult {
  tokens: string[]
}

export interface Tokenizer {
  /**
   * Return undefined if current token is empty.
   */
  tokenize(text: string): TokenizedResult | undefined
}

export function tokenizeText(
  text: string,
  strategy: TokenizeStrategy
): TokenizedResult {
  const tokenizer = getTokenizer(strategy)

  return tokenizer.tokenize(text)
}

function getTokenizer(strategy: TokenizeStrategy): Tokenizer {
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
