
export interface IComposite {
    render( ): void;
    add(child: IComposite): void;
    remove(child: IComposite): void;
    getChildren(): IComposite[];
}
