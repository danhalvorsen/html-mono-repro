import { CompositeNode } from '../../abstract-composition/src/CompositeNode';
import { IRenderEngine } from './IRenderEngine';
export declare abstract class ShapeNode extends CompositeNode {
    abstract render(engine: IRenderEngine): void;
    protected renderChildren(engine: IRenderEngine): void;
}
//# sourceMappingURL=ShapeNode.d.ts.map