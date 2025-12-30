import { ILine } from './ILine.js';
import { IShape } from './IShape.js';

export interface IRectangle extends IShape {
  top: ILine;
  bottom: ILine;
  left: ILine;
  right: ILine;
}
