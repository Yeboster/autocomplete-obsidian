export abstract class Provider {
  abstract readonly category: string
  abstract readonly completions: Array<string>

  matchWith(input: string): Completion[] {
    // TODO: Improve filtering with weights
    const suggestions = this.completions.filter(val => val.includes(input))
      .map(sugg => {
        return {category: this.category, value: sugg}
      })
      .sort((a, b) => a.value.length - b.value.length)

    return suggestions
  }
}

export interface Completion {
  category: string,
  value: string
}
