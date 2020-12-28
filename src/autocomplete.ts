import Provider from './providers/provider'
import LatexProvider from './providers/latex'

export default class AutocompleteView {
  private view: HTMLElement
  private show: boolean
  private providers: Provider[]
  private suggestions: Array<string>
  private selectedIndex?: number
  private currentText?: string
  private cursorAtTrigger?: CodeMirror.Position

  public constructor() {
    this.show = false
    this.suggestions = []
    this.providers = [new LatexProvider()]
  }

  public isShown() {
    return this.show
  }

  public showView(cursor: CodeMirror.Position) {
    this.cursorAtTrigger = cursor
    this.show = true
  }

  public removeView(): void {
    this.show = false
    this.cursorAtTrigger = null

    this.destroyView()
  }

  public updateView(currentLine: string, cursor: CodeMirror.Position): HTMLElement | null {
    if (!this.show) return

    // TODO: Find a diff approach instead of generating all again
    this.destroyView()

    const text = this.completionWord(currentLine, cursor)

    if (text !== this.currentText) {
      this.currentText = text

      this.suggestions = this.providers.reduce((acc: string[], provider: Provider) => {
        const s = provider.matchWith(text)
        return acc.concat(s)
      }, [])
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

  public getSelectedAndPosition(cursor: CodeMirror.Position): [string, CodeMirror.Position, CodeMirror.Position] {
    const textEndIndex = cursor.ch
    const updatedCursorFrom = {
      line: this.cursorAtTrigger.line,
      ch: this.cursorAtTrigger.ch
    }
    const updatedCursorTo = {
      line: this.cursorAtTrigger.line,
      ch: textEndIndex
    }

    const selected = this.getSelected()

    return [selected, updatedCursorFrom, updatedCursorTo]
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
          <span class="prompt-instruction-command">Ctrl+j</span>
          <span>Next Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+k</span>
          <span>Previous Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+enter</span>
          <span>Select Suggestion</span>
        </div>
      </div>
    `
    const containerNode = document.createElement("div")
    containerNode.addClass("suggestion-container")
    containerNode.insertAdjacentHTML('beforeend', viewString)

    // TODO: Add event listeners

    return containerNode
  }

  private completionWord(currentLine: string, cursor: CodeMirror.Position): string | null {
    const word = currentLine.substring(this.cursorAtTrigger.ch, cursor.ch)

    return word
  }

}
