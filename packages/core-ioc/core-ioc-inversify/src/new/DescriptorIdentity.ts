export class DescriptorIdentity {
  public readonly Value: string;
  public readonly CollisionIndex: number;
  public readonly Source: string;

  public constructor(value: string, collisionIndex: number, source: string) {
    this.Value = value;
    this.CollisionIndex = collisionIndex;
    this.Source = source;

    Object.freeze(this);
  }
}