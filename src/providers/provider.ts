export default abstract class Provider {
  abstract readonly category: string
  abstract readonly completions: Array<string>

  matchWith(input: string): Array<string> {
    return this.completions.filter(val => val.includes(input))
  }
}
