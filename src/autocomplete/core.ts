import { Provider } from '../providers/provider'

export type Direction = {
  index: number
  direction: 'forward' | 'backward' | 'still'
}

export function defaultDirection(): Direction {
  return { index: 0, direction: 'still' }
}

export function completionWordIn(
  editor: CodeMirror.Editor,
  cursorAtTrigger?: CodeMirror.Position
) {
  const cursor = editor.getCursor()
  const currentLine: string = editor.getLine(cursor.line)
  const word = currentLine.substring(cursorAtTrigger?.ch || 0, cursor.ch)

  return word
}

export function managePlaceholders(
  selectedValue: string,
  initialCursorIndex: number
): { normalizedValue: string; newCursorPosition: number } {
  let normalizedValue: string
  const placeholder = Provider.placeholder
  let newCursorPosition = initialCursorIndex

  const placeholderIndex = selectedValue.indexOf(placeholder)
  if (placeholderIndex > -1) {
    // TODO: Manage multiple placeholders
    const placeholderRegex = new RegExp(placeholder, 'g')
    normalizedValue = selectedValue.replace(placeholderRegex, '')
    newCursorPosition += placeholderIndex
  } else {
    normalizedValue = selectedValue
    newCursorPosition += selectedValue.length
  }

  return { normalizedValue, newCursorPosition }
}

export function updateSelectedSuggestionFrom(
  event: KeyboardEvent,
  selected: Direction,
  suggestionsLength: number
) {
  let updatedSelected: Direction = selected
  switch (`${event.ctrlKey} ${event.key}`) {
    case 'true p':
    case 'false ArrowUp':
      const decreased = this.selected.index - 1
      updatedSelected = {
        index: decreased < 0 ? suggestionsLength - 1 : decreased,
        direction: 'backward',
      }
      break
    case 'true n':
    case 'false ArrowDown':
      const increased = this.selected.index + 1
      updatedSelected = {
        index: increased >= suggestionsLength ? 0 : increased,
        direction: 'forward',
      }
      break
  }

  return updatedSelected
}
