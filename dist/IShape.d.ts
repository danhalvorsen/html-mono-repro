import { IComposite } from '../../abstract-composition/src/IComposite';
import { IRenderEngine } from './IRenderEngine';
export interface IShape extends IComposite {
    render(engine: IRenderEngine): void;
}
//# sourceMappingURL=IShape.d.ts.map