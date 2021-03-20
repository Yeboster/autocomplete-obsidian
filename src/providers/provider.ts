export abstract class Provider {
  abstract readonly category: string
  abstract completions: Array<string>

  static readonly wordSeparatorRegex = /(\.|,|;|:|'|"|!|\?|-|\)|\]|\}|\/| |Enter)/
  static readonly placeholder: string = '#{}'

  matchWith(input: string): Completion[] {
    const inputLowered = input.toLowerCase()
    const inputHasUpperCase = /[A-Z]/.test(input)

    // TODO: Show lowercase first and the upper case, if search is case insensitive

    const suggestions = this.completions
      .filter((suggestion) => {
        // case-sensitive logic if input has an upper case.
        // Otherwise, uses case-insensitive logic
        let included: boolean
        if (inputHasUpperCase) included = suggestion.includes(input)
        else included = suggestion.toLowerCase().includes(inputLowered)

        return included
      })
      .sort((a, b) => a.length - b.length)
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
