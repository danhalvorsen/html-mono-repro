export interface Component {
    readonly name: string;
    readonly children: ReadonlyArray<Component>;
    createElement(): HTMLElement;
}
