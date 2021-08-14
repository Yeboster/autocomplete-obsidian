import { Plugin } from "obsidian";
import searchWorker from './workers/search'

class AutocompletePlugin extends Plugin {
  // TODO: Use indexedDB
  private store = {};

  async load() {
    console.log('loading autocomplete plugin');

    searchWorker.search(this.store, 'hello there').then(result => {
      console.log(result);
    })
  }

  async onload() {
  }
}

export default AutocompletePlugin;