import PromiseWorker from 'promise-worker';
import Worker from 'web-worker:./worker.ts';

const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);
const search = async (store, query) => {
  const res = await promiseWorker.postMessage({
    type: 'searchTokens', store, query
  });
  return JSON.parse(res);
}

export default { search }