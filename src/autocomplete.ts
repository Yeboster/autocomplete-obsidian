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

    const text = this.completionWord(currentLine, cursor)

    let shouldRerender = false
    if (text !== this.currentText) {
      this.currentText = text
      shouldRerender = true

      this.suggestions = this.providers.reduce((acc: string[], provider: Provider) => {
        const s = provider.matchWith(text)
        return acc.concat(s)
      }, [])
      this.selectedIndex = 0
    }

    let cachedView = false
    if (!this.view || shouldRerender) {
      this.destroyView()
      const view = this.generateView(this.suggestions)
      this.view = view
    } else if (this.view.children &&
      this.view.children[0] &&
      this.view.children[0].children) {
      cachedView = true
      const children = this.view.children[0].children
      const selectedIndex = this.selectedIndex
      const selectedClass = 'is-selected'

      for (let index = 0; index < children.length; index++) {
        const child = children[index]
        const classes = child.classList

        if (index === selectedIndex) {
          if (!classes.contains(selectedClass))
            classes.add(selectedClass)
        } else if (classes.contains(selectedClass))
          classes.remove(selectedClass)
      }
    }

    return cachedView ? null : this.view
  }

  public viewRenderedCallback() {
    // TODO: How to manage click on list ? 
    // Add event listener to every line ?
    this.scrollToSelected()
  }

  private scrollToSelected() {
    // TODO: Improve scrolling behaviour
    const suggestion = document.getElementById(`suggestion-${this.selectedIndex}`)
    if (suggestion)
      suggestion.scrollIntoView()
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
      return `
        <div id="suggestion-${index}" class="no-space-wrap suggestion-item${isSelected ? ' is-selected' : ''}">
          <div class="suggestion-content">${tip}</div>
        </div>
      `
    })
    const viewString = `
      <div id="suggestion-list" class="suggestion">
        ${suggestionsHtml.join('\n')}
      </div>
      <div class="prompt-instructions">
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+N</span>
          <span>Next Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+P</span>
          <span>Previous Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Enter</span>
          <span>Select Suggestion</span>
        </div>
      </div>
    `
    const containerNode = document.createElement("div")
    if (suggestionsHtml.length > 0) {
      containerNode.addClass("suggestion-container")
      containerNode.insertAdjacentHTML('beforeend', viewString)
    }

    return containerNode
  }

  private completionWord(currentLine: string, cursor: CodeMirror.Position): string | null {
    const word = currentLine.substring(this.cursorAtTrigger.ch, cursor.ch)

    return word
  }

}
