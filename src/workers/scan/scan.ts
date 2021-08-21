import registerPromiseWorker from 'promise-worker/register';
import { TokenizerFactory } from 'src/providers/flow/factory';
import { Store } from 'src/core';
import { TokenizeStrategy } from 'src/providers/flow/tokenizer';

registerPromiseWorker((message) => {
  if (message.type === 'scanTokens') {
    type Message = {
      store: Store;
      text: string;
      tokenizerType: TokenizeStrategy;
      tokenizerWordSeparators: string;
    };
    const { store, text, tokenizerType, tokenizerWordSeparators }: Message = message;

    const tokenizer = TokenizerFactory.getTokenizer(tokenizerType, tokenizerWordSeparators);

    const { tokens } = tokenizer.tokenize(text);

    let added = 0;
    for (const token of tokens) {
      // TODO: Use set instead of array
      if (store.every(t => t.value !== token)) {
        added += 1;
        store.push({
          category: "F",
          value: token,
        });
      }
    }
    console.log(`${added} tokens added`);

    return store;
  }
});