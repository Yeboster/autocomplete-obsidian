import PromiseWorker from 'promise-worker';
import Worker from 'web-worker:./worker.ts';

const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);
const search = (store, query) => promiseWorker.postMessage({
  type: 'searchTokens', store, query
});

export default { search }