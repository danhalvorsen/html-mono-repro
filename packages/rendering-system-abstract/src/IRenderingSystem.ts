import { IShape } from '@my-graphics/types-abstract';

export interface IRenderingSystem {
  canvas: any;
  drawShape(shape: IShape): void;
  render(): void;
  clear(): void;
}