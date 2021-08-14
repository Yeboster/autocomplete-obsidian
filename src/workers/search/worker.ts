import registerPromiseWorker from 'promise-worker/register';

registerPromiseWorker((message) => {
  if (message.type === 'searchTokens') {
    let store = message.store;
    let query = message.query;
    console.log(message);
    return JSON.stringify({ store, query });
  }
});