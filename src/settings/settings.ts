import { TokenizeStrategy } from 'src/providers/flow/tokenizer'

export class AutocompleteSettings {
  enabled: boolean = true

  /*
   * Trigger on ctrl-p/n bindings
   */
  triggerLikeVim: boolean = false
  autoSelect: boolean = true

  // TODO: Refactor provider settings
  latexProvider: boolean = true
  flowProvider: boolean = true
  flowProviderScanCurrent: boolean = true
  flowProviderTokenizeStrategy: TokenizeStrategy = 'default'
}
