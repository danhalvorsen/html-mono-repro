import { APP_GLOBAL_STYLE_TOKENS } from './app-global-style-tokens'
import {
  applyGlobalStyleConfig,
  GlobalStyleResolver,
  type IGlobalStyleReference,
} from './global-style-system'

const resolver = new GlobalStyleResolver(APP_GLOBAL_STYLE_TOKENS)

export const applyAppGlobalStyle = (
  reference: Readonly<IGlobalStyleReference> = { token: 'app' },
): void => {
  const config = resolver.resolve(reference)
  applyGlobalStyleConfig(config)
}
