import { ARABIC_TRIM_CHAR_PATTERN } from '../tokenizer'
import { DefaultTokenizer } from './default'

export class ArabicTokenizer extends DefaultTokenizer {
  protected readonly trimPattern: RegExp = ARABIC_TRIM_CHAR_PATTERN
}
