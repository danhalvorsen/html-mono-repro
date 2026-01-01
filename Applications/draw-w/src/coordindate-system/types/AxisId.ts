export class AxisId {
  static readonly X = new AxisId('x')
  static readonly Y = new AxisId('y')

  readonly value: 'x' | 'y'

  private constructor(value: 'x' | 'y') {
    this.value = value
  }

  static from(value: string): AxisId {
    return value === 'y' ? AxisId.Y : AxisId.X
  }
}
