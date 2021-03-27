import { TinySegmenter } from 'src/vendor/tiny-segmenter'
import { Range, Tokenizer } from '../tokenizer'

export class JapaneseTokenizer extends Tokenizer {
  // TODO: Improve typings
  private tokenizer = TinySegmenter()

  tokenize(text: string, range?: Range) {
    const tokens: string[] = text
      .slice(range?.start, range?.end)
      .split('\n')
      .flatMap<string>((line) => this.tokenizer.segment(line))
      .map((t) => t.replace(this.trimPattern, ''))

    return { tokens }
  }
}
