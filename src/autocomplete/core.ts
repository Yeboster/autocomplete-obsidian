import { Autocomplete } from 'src/autocomplete'
import { AutocompleteSettings } from 'src/settings/settings'
import { Provider } from '../providers/provider'

export type Direction = {
  index: number
  direction: 'forward' | 'backward' | 'still'
}

export function defaultDirection(): Direction {
  return { index: 0, direction: 'still' }
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

export function selectLastSuggestion(
  selected: Direction,
  suggestionsLength: number
): Direction {
  const decreased = selected.index - 1
  const updatedSelected: Direction = {
    index: decreased < 0 ? suggestionsLength - 1 : decreased,
    direction: 'backward',
  }

  return updatedSelected
}

export function updateSelectedSuggestionFrom(
  event: KeyboardEvent,
  selected: Direction,
  suggestionsLength: number
): Direction {
  let updatedSelected: Direction = selected
  switch (`${event.ctrlKey} ${event.key}`) {
    case 'true p':
    case 'false ArrowUp':
      updatedSelected = selectLastSuggestion(selected, suggestionsLength)
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

export function copyObject(obj: any): any {
  return { ...obj }
}

export function isVimNormalMode(editor: CodeMirror.Editor): boolean {
  return editor.getOption('keyMap') === 'vim'
}

export function isVimTrigger({
  settings,
  editor,
  event,
}: {
  settings: AutocompleteSettings
  editor: CodeMirror.Editor
  event: KeyboardEvent
}) {
  return (
    settings.triggerLikeVim &&
    !isVimNormalMode(editor) &&
    event.ctrlKey &&
    (event.key === 'n' || event.key === 'p')
  )
}
