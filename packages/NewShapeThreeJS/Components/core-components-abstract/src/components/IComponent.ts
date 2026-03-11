import { IFeatureCollection } from '@monorepo/core-reactive-abstract';
import { IShapeCollection} from  '@monorepo/core-new-shapes-abstract';  
export interface IComponent {
    onTick(delta: number): void;
}

export interface IVisualComponent extends IComponent {
    shapes : IShapeCollection;
    render(): void;
}
