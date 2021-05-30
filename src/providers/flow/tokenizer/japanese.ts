import { TinySegmenter } from 'src/vendor/tiny-segmenter'
import { Range, Tokenizer, TokenizerOptions } from '../tokenizer'

export class JapaneseTokenizer extends Tokenizer {
  // @ts-ignore
  private tokenizer = new TinySegmenter()

  tokenize(text: string, range?: Range) {
    const tokens: string[] = text
      .slice(range?.start, range?.end)
      .split('\n')
      .flatMap<string>((line) => this.tokenizer.segment(line))
      .map((t) => t.replace(this.trimPattern, ''))

    return { tokens }
  }

  lastWordFrom(
    text: string,
    index: number,
    options: TokenizerOptions = { normalize: false }
  ): string | null {
    const { normalized } = options.normalize
      ? this.normalizedLine(text, index)
      : { normalized: text }

    const tokens = this.tokenizer
      .segment(normalized)
      .map((t: string) => t.replace(this.trimPattern, ''))
    const length = tokens.length

    return length > 0 ? tokens[length - 1] : null
  }
}
