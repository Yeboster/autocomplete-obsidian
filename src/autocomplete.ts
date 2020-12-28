import Provider from './providers/provider'
import LatexProvider from './providers/latex'

export default class AutocompleteView {
  private view: HTMLElement
  private show: boolean
  private suggestions: Array<string>
  private currentText: string | undefined
  private selectedIndex: number | undefined
  private providers: Provider[]

  public constructor() {
    this.show = false
    this.suggestions = []
    this.providers = [new LatexProvider()]
  }

  public isShown() {
    return this.show
  }

  public showView() {
    this.show = true
  }

  public removeView(): void {
    this.show = false

    this.destroyView()
  }

  public updateView(cursor: CodeMirror.Position, currentLine: string): HTMLElement | null {
    console.log('updating view...', this.show)
    if (!this.show) return

    // TODO: Find a diff approach instead of generating all again
    this.destroyView()

    const text = this.lastWord(cursor.ch, currentLine)

    if (text !== this.currentText) {
      this.currentText = text

      const suggestions = this.providers.reduce((acc: string[], provider: Provider) => {
        const s = provider.matchWith(text)
        return acc.concat(s)
      }, [])
      this.suggestions = suggestions
      this.selectedIndex = 0
    }

    const view = this.generateView(this.suggestions)
    this.view = view

    return this.view
  }

  public selectNext() {
    if (this.selectedIndex >= 0) {
      const increased = this.selectedIndex + 1
      this.selectedIndex = increased >= this.suggestions.length ? 0 : increased
    } else
      this.selectedIndex = 0
  }

  public selectPrevious() {
    if (this.selectedIndex >= 0) {
      const decreased = this.selectedIndex - 1
      this.selectedIndex = decreased < 0 ? this.suggestions.length - 1 : decreased
    } else
      this.selectedIndex = this.suggestions.length - 1
  }

  public getSelectedAndPosition(line: string, cursor: CodeMirror.Position): [string, CodeMirror.Position] {
    const cursorPosition = cursor.ch

    const wordIndex = this.lastWordIndex(cursorPosition, line)
    const updatedCursorFrom = {
      line: cursor.line,
      ch: wordIndex
    }

    const selected = this.getSelected()

    return [selected, updatedCursorFrom]
  }

  private getSelected() {
    return this.suggestions[this.selectedIndex]
  }

  private destroyView() {
    if (!this.view) return

    const parentNode = this.view.parentNode
    if (parentNode)
      parentNode.removeChild(this.view)
    this.view = null
  }

  private generateView(suggestions: Array<string>) {
    const suggestionsHtml = suggestions.map((tip, index) => {
      const isSelected = this.selectedIndex === index
      // TODO: Add provider category as div.suggestion-content > span.suggestion-flair
      // TODO: Fix missing custom css styles and remove style hotfix
      return `
        <div id="suggestion-${index}" style="white-space: nowrap;" class="suggestion-item${isSelected ? ' is-selected' : ''}">
          <div class="suggestion-content">${tip}</div>
        </div>
      `
    })
    const viewString = `
       <div class="suggestion">
         ${suggestionsHtml.join('\n')}
       </div>
       <div class="prompt-instructions">
         <div class="prompt-instruction">
           <span>Autocomplete actions</span>
         </div>
       </div>
    `
    const containerNode = document.createElement("div")
    containerNode.addClass("suggestion-container")
    containerNode.insertAdjacentHTML('beforeend', viewString)

    // TODO: Add event listeners

    return containerNode
  }

  private lastWordIndex(cursorAt: number, text: string): number {
    let wordStartIndex = 0

    for (let index = cursorAt; index-- >= 0;) {
      if (text[index] === ' ') {
        wordStartIndex = index + 1 // Maintain space
        break
      }
    }

    return wordStartIndex
  }

  private lastWord(cursorPosition: number, currentLine: string): string | null {
    const wordStartIndex = this.lastWordIndex(cursorPosition, currentLine)
    const word = currentLine.substring(wordStartIndex, cursorPosition)

    return word
  }

}
