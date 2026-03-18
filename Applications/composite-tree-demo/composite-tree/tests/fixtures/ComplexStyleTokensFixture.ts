import { appDesignPolicy } from '../../src/design-system/AppDesignPolicy.js'
import { ShapeStylePolicy } from '../../src/rendering/ShapeStylePolicy.js'
import type { IStyleReference } from '@monorepo/core-style-system'

export class ComplexStyleTokensFixture {
  public readonly resolver = appDesignPolicy.getShapeStyleResolver()
  public readonly policy = new ShapeStylePolicy()

  public resolveShape(token: string) {
    return this.resolver.resolve({ token })
  }

  public resolveGlobal(token: string) {
    return appDesignPolicy.resolveGlobalStyle({ token })
  }

  public resolveEndpointFromLineColor(
    lineToken: string,
    vertexReference: Readonly<IStyleReference> | undefined,
  ) {
    const lineStyle = this.resolveShape(lineToken)
    const endpointReference = this.policy.lineEndpointReference(vertexReference, lineStyle)
    return this.resolver.resolve(endpointReference)
  }
}
