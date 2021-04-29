import { DefaultTokenizer } from './default'

export class ArabicTokenizer extends DefaultTokenizer {
  protected readonly wordSeparatorPattern: RegExp = /[\[\]()<>"'.,|; `!?$،؛]/
}
