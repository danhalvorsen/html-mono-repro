import { StyleLibrary, StyleResolver, type IStyleResolver } from '@monorepo/core-style-system'

import { APP_STYLE_TOKENS } from '../Style/app-style-tokens'
import { APP_GLOBAL_STYLE_TOKENS } from '../Style/app-global-style-tokens'
import {
  GlobalStyleResolver,
  applyGlobalStyleConfig,
  type IGlobalStyleConfig,
  type IGlobalStyleReference,
} from '../Style/global-style-system'

export class AppDesignPolicy {
  private readonly shapeResolver = new StyleResolver([
    new StyleLibrary(APP_STYLE_TOKENS),
  ])

  private readonly globalResolver = new GlobalStyleResolver(APP_GLOBAL_STYLE_TOKENS)

  public getShapeStyleResolver(): IStyleResolver {
    return this.shapeResolver
  }

  public resolveGlobalStyle(
    reference: Readonly<IGlobalStyleReference> = { token: 'canvas' },
  ): IGlobalStyleConfig {
    return this.globalResolver.resolve(reference)
  }

  public applyGlobalStyle(reference: Readonly<IGlobalStyleReference> = { token: 'canvas' }): void {
    applyGlobalStyleConfig(this.resolveGlobalStyle(reference))
  }
}

export const appDesignPolicy = new AppDesignPolicy()
