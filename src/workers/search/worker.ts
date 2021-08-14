import registerPromiseWorker from 'promise-worker/register';
import { Completion } from 'src/core';

const matchAll = (store: Completion[], query: string): Completion[] => {
  const inputLowered = query.toLowerCase();
  const inputHasUpperCase = /[A-Z]/.test(query);

  // case-sensitive logic if input has an upper case.
  // Otherwise, uses case-insensitive logic
  const suggestions = store
    .filter((suggestion) => {
      const value = suggestion.value;
      return value !== query
        ? inputHasUpperCase
          ? value.includes(query)
          : value.toLowerCase().includes(inputLowered)
        : false;
    })
    .sort(({ value: a }, { value: b }) => a.localeCompare(b))
    .sort(
      ({ value: a }, { value: b }) =>
        Number(b.toLowerCase().startsWith(inputLowered)) -
        Number(a.toLowerCase().startsWith(inputLowered))
    )
    .map((suggestion) => {
      return { category: suggestion.category, value: suggestion.value };
    });

  return suggestions;
};

registerPromiseWorker((message) => {
  if (message.type === 'searchTokens') {
    const { query, store } = message;

    const matches = matchAll(store, query);

    return JSON.stringify(matches);
  }
});