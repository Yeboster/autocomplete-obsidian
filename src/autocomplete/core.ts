import { Provider } from '../providers/provider'

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
