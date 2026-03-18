import { appDesignPolicy } from '../../src/design-system/AppDesignPolicy.js'

export class AppDesignPolicyFixture {
  public readonly styleResolver = appDesignPolicy.getShapeStyleResolver()

  public resolveShape(token: string) {
    return this.styleResolver.resolve({ token })
  }

  public resolveGlobal(token: string) {
    return appDesignPolicy.resolveGlobalStyle({ token })
  }
}
