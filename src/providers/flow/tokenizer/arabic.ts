import { TokenizeStrategy } from 'src/providers/flow/tokenizer';
import { DefaultTokenizer } from './default';

export class ArabicTokenizer extends DefaultTokenizer {
  type: TokenizeStrategy = "arabic";
}
