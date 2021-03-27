import { TinySegmenter } from 'src/vendor/tiny-segmenter'
import { Tokenizer, TRIM_CHAR_PATTERN } from '../tokenizer'

export class JapaneseTokenizer implements Tokenizer {
  // TODO: Improve typings
  private tokenizer = TinySegmenter()

  tokenize(text: string) {
    const tokens: string[] = text
      .split('\n')
      .flatMap<string>((line) => this.tokenizer.segment(line))
      .map((t) => t.replace(TRIM_CHAR_PATTERN, ''))

    return { tokens }
  }
}
