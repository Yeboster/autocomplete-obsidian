export abstract class Provider {
  abstract readonly category: string
  abstract completions: Array<string>

  static readonly wordSeparatorRegex = /(\.|,|;|:|'|"|!|\?|-|\)|\]|\}|\/| |Enter)/g
  static readonly placeholder: string = '#{}'

  matchWith(input: string): Completion[] {
    const inputLowered = input.toLowerCase()
    const inputHasUpperCase = /[A-Z]/.test(input)

    // case-sensitive logic if input has an upper case.
    // Otherwise, uses case-insensitive logic
    const suggestions = this.completions
      .filter((suggestion) =>
        suggestion != input
          ? inputHasUpperCase
            ? suggestion.includes(input)
            : suggestion.toLowerCase().includes(inputLowered)
          : false
      )
      .sort((a, b) => a.localeCompare(b))
      .sort(
        (a, b) =>
          Number(b.toLowerCase().startsWith(inputLowered)) -
          Number(a.toLowerCase().startsWith(inputLowered))
      )
      .map((suggestion) => {
        return { category: this.category, value: suggestion }
      })

    return suggestions
  }
}

export interface Completion {
  category: string
  value: string
}
