import { TokenizeStrategy } from 'src/providers/flow/tokenizer'

export class AutocompleteSettings {
  enabled: boolean = true

  // TODO: Refactor provider settings
  latexProvider: boolean = true
  flowProvider: boolean = true
  flowProviderScanCurrent: boolean = true
  flowProviderScanCurrentStrategy: TokenizeStrategy = 'default'
}
