import { Tokenizer, TRIM_CHAR_PATTERN } from '../tokenizer'

export class DefaultTokenizer implements Tokenizer {
  protected readonly trimPattern: RegExp = TRIM_CHAR_PATTERN

  tokenize(text: string) {
    const tokens = text
      .split('\n')
      .flatMap<string>((line) => line.split(this.trimPattern))
      .filter((t) => t.length > 0 && t !== ' ')
      .map((t) => t.trim())

    return { tokens }
  }
}
