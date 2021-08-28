import { Editor } from "codemirror";
import { Completion } from "src/core";
import AutocompletePlugin from "src/main";
import { Tokenizer } from "src/providers/flow/tokenizer";
import { Provider } from "src/providers/provider";

export type ClickListenerOptions = {
  view: HTMLElement,
  editor: Editor,
  remove?: boolean;
};

export type Direction = {
  index: number;
  direction: 'forward' | 'backward' | 'still';
};

export function defaultDirection(): Direction {
  return { index: 0, direction: 'still' };
}

export function managePlaceholders(
  selectedValue: string,
  initialCursorIndex: number
): { normalizedValue: string; newCursorPosition: number; } {
  let normalizedValue: string;
  const placeholder = Provider.placeholder;
  let newCursorPosition = initialCursorIndex;

  const placeholderIndex = selectedValue.indexOf(placeholder);
  if (placeholderIndex > -1) {
    // TODO: Manage multiple placeholders
    const placeholderRegex = new RegExp(placeholder, 'g');
    normalizedValue = selectedValue.replace(placeholderRegex, '');
    newCursorPosition += placeholderIndex;
  } else {
    normalizedValue = selectedValue;
    newCursorPosition += selectedValue.length;
  }

  return { normalizedValue, newCursorPosition };
}

export function generateView(suggestions: Completion[], selectedIndex: number) {
  const suggestionsHtml = suggestions.map((tip: any, index) => {
    const isSelected = selectedIndex === index;
    return `
        <div id="suggestion-${index}" class="no-space-wrap suggestion-item${isSelected ? ' is-selected' : ''
      }">
          <div id="suggestion-${index}" class="suggestion-content">
          <span class="suggestion-flair">${tip.category}</span>
          ${tip.value}
          </div>
        </div>
      `;
  }, []);
  const suggestionsJoined = suggestionsHtml.join('\n');
  const viewString = `
      <div id="suggestion-list" class="suggestion">
        ${suggestionsJoined.length > 0
      ? suggestionsJoined
      : '<div class="no-suggestions">No match found</div>'
    }
      </div>
      <div class="prompt-instructions">
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+N /↑ </span>
          <span>Next Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Ctrl+P /↓ </span>
          <span>Previous Suggestion</span>
        </div>
        <div class="prompt-instruction">
          <span class="prompt-instruction-command">Enter/Tab</span>
          <span>Select Suggestion</span>
        </div>
      </div>
    `;
  const containerNode = document.createElement('div');
  containerNode.classList.add('suggestion-container');
  containerNode.insertAdjacentHTML('beforeend', viewString);

  return containerNode;
}

export function updateCachedView(view: HTMLElement, selectedIndex: number) {
  const children = view.firstElementChild?.children;

  if (!children) return;

  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    child.toggleClass('is-selected', index === selectedIndex);
  }
}

export function scrollTo(
  selected: Direction,
  view: HTMLElement,
  suggestionsLength: number
) {
  if (!view || suggestionsLength === 0) return;

  // TODO: Improve scrolling with page size and boundaries

  const parent = view.children[0];
  const selectedIndex = selected.index;
  const child = parent.children[0];
  if (child) {
    let scrollAmount = child.scrollHeight * selectedIndex;

    switch (selected.direction) {
      case 'forward':
        if (selectedIndex === 0)
          // End -> Start
          parent.scrollTop = 0;
        else parent.scrollTop = scrollAmount;
        break;
      case 'backward':
        if (selectedIndex === suggestionsLength - 1)
          // End <- Start
          parent.scrollTop = parent.scrollHeight;
        else parent.scrollTop = scrollAmount;
        break;
    }
  }
}

export function appendWidget(
  editor: CodeMirror.Editor,
  view: HTMLElement,
  scrollable = true
) {
  const cursor = editor.getCursor();

  // TODO: Find a better way for rendering for scroll

  editor.addWidget({ ch: cursor.ch, line: cursor.line }, view, scrollable);
}

export function updateSelectedSuggestionFrom(
  event: KeyboardEvent,
  selected: Direction,
  suggestionsLength: number
): Direction {
  let updatedSelected: Direction = selected;
  switch (`${event.ctrlKey} ${event.key}`) {
    // Select last suggestion
    case 'true p':
    case 'false ArrowUp':
      const decreased = selected.index - 1;
      updatedSelected = {
        index: decreased < 0 ? suggestionsLength - 1 : decreased,
        direction: 'backward',
      };
      break;

    // Select next suggestion
    case 'true n':
    case 'false ArrowDown':
      const increased = selected.index + 1;
      updatedSelected = {
        index: increased >= suggestionsLength ? 0 : increased,
        direction: 'forward',
      };
      break;
  }

  return updatedSelected;
}

export type UpdateOptions = {
  editor: Editor,
  currentWord: string,
  event?: KeyboardEvent,
  getSuggestions: (query: string) => Completion[];
};

// Sets cursor at the beginning of the word
export function extractCursorAtTrigger(editor: Editor, tokenizer: Tokenizer) {
  const cursor = { ...editor.getCursor() };
  const currentLine: string = editor.getLine(cursor.line);

  const wordStartIndex = tokenizer.lastWordStartPos(
    currentLine,
    cursor.ch
  );
  cursor.ch = wordStartIndex;

  return cursor;
}
