export interface IBehaviorNode {
  readonly id: string;
  readonly name: string;
  add(child: IBehaviorNode): void;
  remove(child: IBehaviorNode): void;
  getChildren(): IBehaviorNode[];
  apply(target: unknown): void;
}

export interface IBehaviorNode {
  readonly id: string;
  readonly name: string;
  add(child: IBehaviorNode): void;
  remove(child: IBehaviorNode): void;
  getChildren(): IBehaviorNode[];
  apply(target: unknown): void;
}

export abstract class BehaviorBase implements IBehaviorNode {
  private readonly children: IBehaviorNode[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  add(child: IBehaviorNode): void {
    this.children.push(child);
  }

  remove(child: IBehaviorNode): void {
    const i = this.children.indexOf(child);
    if (i !== -1) this.children.splice(i, 1);
  }

  getChildren(): IBehaviorNode[] {
    return this.children;
  }

  abstract apply(target: unknown): void;
}
