import { TokenizeStrategy } from 'src/providers/flow/tokenizer'

export class AutocompleteSettings {
  enabled: boolean = true

  autoSelect: boolean = false
  autoTrigger: boolean = true
  autoTriggerMinSize: number = 3

  /*
   * Trigger on ctrl-p/n bindings
   */
  triggerLikeVim: boolean = false

  // TODO: Refactor provider settings
  latexProvider: boolean = false
  flowProvider: boolean = true
  flowProviderScanCurrent: boolean = true
  flowProviderTokenizeStrategy: TokenizeStrategy = 'default'
}
