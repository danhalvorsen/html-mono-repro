import { IVisitor } from "./IVisitor.js";

export interface IComposite {
    accept(v: IVisitor): void;
    add(child: IComposite): void;
    remove(child: IComposite): void;
    getChildren(): IComposite[];
}
