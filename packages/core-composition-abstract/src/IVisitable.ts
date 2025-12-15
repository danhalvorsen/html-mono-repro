import { IVisitor } from './IVisitor.js';
export interface IVisitable { accept(visitor: IVisitor): void; }
