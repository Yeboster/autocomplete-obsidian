import { Range, Tokenizer } from '../tokenizer'

export class DefaultTokenizer extends Tokenizer {
  tokenize(text: string, range?: Range) {
    const tokens = text
      .slice(range?.start, range?.end)
      .split('\n')
      .flatMap<string>((line) => line.split(this.trimPattern))
      .filter((t) => t.length > 0)

    return { range, tokens }
  }
}
