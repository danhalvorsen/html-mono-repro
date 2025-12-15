
/** Uncomment and adjust the import statement below if core-reactive-controller is a local workspace package */
// import { AbstractReactiveController, IReactiveHost, DomReactiveHost } from '../core-reactive-controller';

import { IReactiveHost, DomReactiveHost, AbstractReactiveController } from 'core-reactive-controller';

export abstract class DomReactiveController extends AbstractReactiveController {

  attachTo(host: IReactiveHost): void {
    if (!(host instanceof DomReactiveHost)) {
      throw new Error("DomReactiveController must attach to DomReactiveHost");
    }
    super.attachTo(host);
  }

  /** Convenience getter */
  protected get element(): HTMLElement {
    return (this as any).host.element as HTMLElement;
  }
}
