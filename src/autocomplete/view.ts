import { Completion } from '../providers/provider'

export function defaultDirection(): Direction {
  return { index: 0, direction: 'still' }
}

export function generateView(suggestions: Completion[], selectedIndex: number) {
  const suggestionsHtml = suggestions.map((tip: Completion, index) => {
    const isSelected = selectedIndex === index
    return `
        <div id="suggestion-${index}" class="no-space-wrap suggestion-item${
      isSelected ? ' is-selected' : ''
    }">
          <div id="suggestion-${index}" class="suggestion-content">
          <span class="suggestion-flair">${tip.category}</span>
          ${tip.value}
          </div>
        </div>
      `
  }, [])
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
  const containerNode = document.createElement('div')
  if (suggestionsHtml.length > 0) {
    containerNode.classList.add('suggestion-container')
    containerNode.insertAdjacentHTML('beforeend', viewString)
  }

  return containerNode
}
