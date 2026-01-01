export class AxisInterval {
  readonly min: number
  readonly max: number

  constructor(min: number, max: number) {
    this.min = min
    this.max = max
  }

  get span(): number {
    return this.max - this.min
  }
}
