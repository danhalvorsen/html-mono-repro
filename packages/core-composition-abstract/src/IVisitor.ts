import { IComposite } from './IComposite.js';
export interface IVisitor {
    visitComposite(node: IComposite): void; visitLeaf(node: IComposite): void;
}
