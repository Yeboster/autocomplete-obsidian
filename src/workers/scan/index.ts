import PromiseWorker from 'promise-worker';
import { Store } from 'src/core';
import { Tokenizer } from 'src/providers/flow/tokenizer';

// @ts-ignore
import ScanWorker from 'web-worker:./scan.ts';

const scanWorker = new ScanWorker();
const promiseScanWorker = new PromiseWorker(scanWorker);

type ScanOptions = {
  store: Store,
  text: string,
  tokenizer: Tokenizer;
};
const scan = async ({ store, text, tokenizer }: ScanOptions) => {
  const tokenizerType = tokenizer.type;
  const tokenizerWordSeparators = tokenizer.wordSeparators;
  console.log('Going to scan file...');
  const res = await promiseScanWorker.postMessage({
    type: 'scanTokens', store, text, tokenizerType, tokenizerWordSeparators
  });
  return res;
};

export default { scan };
