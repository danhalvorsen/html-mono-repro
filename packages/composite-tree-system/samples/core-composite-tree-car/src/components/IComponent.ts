import { IFeatureCollection } from '@monorepo/core-reactive-abstract';
export interface IComponent {
    onTick(delta: number): void;
}

export interface IVisualComponent extends IComponent {
    shapes : IShapeCollection;
    render(): void;
}
