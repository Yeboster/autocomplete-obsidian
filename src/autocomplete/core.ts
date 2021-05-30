import { Autocomplete } from 'src/autocomplete'
import { Tokenizer } from 'src/providers/flow/tokenizer'
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
  triggerLikeVim,
  editor,
  event,
}: {
  triggerLikeVim: boolean
  editor: CodeMirror.Editor
  event: KeyboardEvent
}) {
  return (
    triggerLikeVim &&
    !isVimNormalMode(editor) &&
    event.ctrlKey &&
    (event.key === 'n' || event.key === 'p')
  )
}

const PRINTABLE_CHARS: string[] = ["Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Minus", "Equal", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backquote", "Backslash", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "NumpadMultiply", "Numpad7", "Numpad8", "Numpad9", "NumpadSubtract", "Numpad4", "Numpad5", "Numpad6", "NumpadAdd", "Numpad1", "Numpad2", "Numpad3", "Numpad0", "NumpadDecimal"]
export function isKeyboardCodePrintable(code: string) {
  return PRINTABLE_CHARS.includes(code)
}

export function isAutoTrigger(
  editor: CodeMirror.Editor,
  event: KeyboardEvent,
  tokenizer: Tokenizer,
  settings: AutocompleteSettings
) {
  let trigger = false
  if (
    settings.autoTrigger &&
    !isVimNormalMode(editor) &&
    !tokenizer.isWordSeparator(event.key) &&
    isKeyboardCodePrintable(event.code) && 
    !(event.metaKey && (event.code === "KeyC" || event.code === "KeyV" || event.code === "KeyZ")) // Not on copy/paste/undo
  ) {
    const cursor = editor.getCursor()
    const currentLine = editor.getLine(cursor.line)
    // If last word is longer or eq than threshold
    trigger =
      currentLine.length - tokenizer.lastWordStartPos(currentLine, cursor.ch) >=
      settings.autoTriggerMinSize
  }

  return trigger
}
