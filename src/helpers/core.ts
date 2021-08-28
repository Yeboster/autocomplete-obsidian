import { Tokenizer } from "src/providers/flow/tokenizer";

export function copyObject(obj: any): any {
  return { ...obj };
}

export function isVimNormalMode(editor: CodeMirror.Editor): boolean {
  return editor.getOption('keyMap') === 'vim';
}

const PRINTABLE_KEYS: string[] = ["Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Minus", "Equal", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backquote", "Backslash", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Space", "Comma", "Period", "Slash", "NumpadMultiply", "Numpad7", "Numpad8", "Numpad9", "NumpadSubtract", "Numpad4", "Numpad5", "Numpad6", "NumpadAdd", "Numpad1", "Numpad2", "Numpad3", "Numpad0", "NumpadDecimal"];
export function isKeyboardCodePrintable(code: string) {
  return PRINTABLE_KEYS.includes(code);
}

export function isTrigger(event: KeyboardEvent): boolean {
  return event.ctrlKey && event.code === "Space";
}

// TODO: Implement settings
export function isAutoTrigger(
  editor: CodeMirror.Editor,
  event: KeyboardEvent,
  tokenizer: Tokenizer,
  // settings: AutocompleteSettings
) {
  let trigger = false;
  if (
    // settings.autoTrigger &&
    !isVimNormalMode(editor) &&
    !tokenizer.isWordSeparator(event.key) &&
    isKeyboardCodePrintable(event.code) &&
    // Not on copy/cut/paste/undo
    !(
      (event.ctrlKey || event.metaKey) &&
      (event.code === 'KeyX' ||
        event.code === 'KeyC' ||
        event.code === 'KeyV' ||
        event.code === 'KeyZ')
    )
  ) {
    const cursor = editor.getCursor();
    const currentLine = editor.getLine(cursor.line);
    // If last word is longer or eq than threshold
    // TODO: Uncomment settings
    trigger =
      currentLine.length - tokenizer.lastWordStartPos(currentLine, cursor.ch) >=
      3; // settings.autoTriggerMinSize;
  }

  return trigger;
}
