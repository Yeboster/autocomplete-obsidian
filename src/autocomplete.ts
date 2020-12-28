export default class AutocompleteView {
  private view: HTMLElement
  private show: boolean

  public constructor() {
    this.show = false
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

    const text = this.autocompleteText(cursor, currentLine)
    console.log('last line', text)

    // TODO: Generate results

    const view = this.generateView(text)
    this.view = view

    return this.view
  }

  private destroyView() {
    if (!this.view) return

    const parentNode = this.view.parentNode
    if (parentNode)
      parentNode.removeChild(this.view)
    this.view = null
  }

  private generateView(autocompleteText: string) {
    const viewString = `
       <div class="suggestion">
        <div class="suggestion-item">
          <div class="suggestion-content">
            ${autocompleteText}
          </div>
        </div
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


  private autocompleteText(cursor: CodeMirror.Position, currentLine: string): string | null {
    const cursorPosition = cursor.ch
    const words = currentLine.substring(0, cursorPosition).split(' ')
    console.log('words', words)
    let command: string | null = null
    if (words.length > 0) {
      const lastWord = words[words.length - 1]
      if (lastWord.length > 0) command = lastWord
    }
    return command
  }

}
