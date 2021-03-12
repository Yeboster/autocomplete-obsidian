import { Provider } from '../providers/provider'

export type Direction = {
  index: number
  direction: 'forward' | 'backward' | 'still'
}

export function defaultDirection(): Direction {
  return { index: 0, direction: 'still' }
}

export function getLastWordIn(editor: CodeMirror.Editor) {
  const cursor = editor.getCursor()
  const currentLine: string = editor.getLine(cursor.line)
  const word = getLastWordFrom(currentLine, cursor.ch)

  return word
}

export function getLastWordFrom(
  line: string,
  cursorIndex: number
): string | null {
  let wordStartIndex = cursorIndex
  const wordRegex = /[\w$]+/
  while (wordStartIndex && wordRegex.test(line.charAt(wordStartIndex - 1)))
    wordStartIndex -= 1

  let word: string | null = null
  if (wordStartIndex !== cursorIndex)
    word = line.slice(wordStartIndex, cursorIndex)

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
      const decreased = selected.index - 1
      updatedSelected = {
        index: decreased < 0 ? suggestionsLength - 1 : decreased,
        direction: 'backward',
      }
      break
    case 'true n':
    case 'false ArrowDown':
      const increased = selected.index + 1
      updatedSelected = {
        index: increased >= suggestionsLength ? 0 : increased,
        direction: 'forward',
      }
      break
  }

  return updatedSelected
}
