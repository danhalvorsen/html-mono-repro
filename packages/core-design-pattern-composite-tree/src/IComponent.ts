
export interface IComponent<TNode> {
  readonly name: string;
  operation(): void;
  getChildren(): readonly TNode[];
}