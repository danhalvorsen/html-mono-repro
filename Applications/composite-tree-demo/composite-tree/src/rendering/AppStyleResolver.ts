import { StyleLibrary, StyleResolver } from '@monorepo/core-style-system'
import { APP_STYLE_TOKENS } from '../app-style-tokens'

export const appStyleResolver = new StyleResolver([
  new StyleLibrary(APP_STYLE_TOKENS),
])
