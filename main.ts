import {Plugin, Workspace} from 'obsidian'

export default class AutocompletePlugin extends Plugin {
  autocompleteView: HTMLElement

  async onload() {
    console.log('Loading Obsidian Autocomplete...')
    this.app.workspace.on('codemirror', (editor) => {
      editor.on('change', (cm, event) => {
        const cursor = cm.getCursor()
        const currentLineNumber = cursor.line
        const currentLine: string = cm.getLine(currentLineNumber)

        const autocompleteText = this.autocompleteText(cursor, currentLine)

        if (autocompleteText) {
          const autocompleteView = this.getAutocompleteView(autocompleteText)
          editor.addWidget({ch: 30, line: currentLineNumber}, autocompleteView, false)
        } else {
          this.removeAutocompleteView()
        }
      })
    })
  }

  // TODO: Create AutocompleteView module
  
  private getAutocompleteView(autocompleteText: string): HTMLElement {
    // TODO: Find a less distructive approach
    this.removeAutocompleteView()

    // TODO: Add list view
    const containerNode = document.createElement("div")
    containerNode.addClass("suggestion-container")
    containerNode.insertAdjacentHTML('beforeend', `
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
                                     `)

    this.autocompleteView = containerNode

    return this.autocompleteView
  }

  private removeAutocompleteView(): void {
    if (!this.autocompleteView) return

    const parentNode = this.autocompleteView.parentNode
    if (parentNode)
      parentNode.removeChild(this.autocompleteView)
  }

  private autocompleteText(cursor: CodeMirror.Position, currentLine: string): string | null {
    console.log('current line', currentLine)
    const cursorPosition = cursor.ch
    const allSlashes = currentLine.substring(0, cursorPosition).split('/')
    console.log('splitted /', allSlashes)
    let command: string | null = null
    if (allSlashes.length > 1) {
      const lastSlash = allSlashes[allSlashes.length - 1]
      if (!lastSlash.includes(" ")) command = lastSlash
    }
    return command
  }

  public async restart() {
    await this.onload()
  }


  async onunload() {
    console.log('Bye!')
  }
}
