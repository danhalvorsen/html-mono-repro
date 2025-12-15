export class HermiteSegment<T> {
  constructor(
    public readonly p0: T,
    public readonly p1: T,
    public readonly m0: T,
    public readonly m1: T
  ) {}
}