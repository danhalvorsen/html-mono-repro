import { AxisId } from '../types/AxisId'
import { AxisInterval } from '../types/AxisInterval'

export class AxisState {
  readonly id: AxisId
  readonly interval: AxisInterval

  constructor(id: AxisId, interval: AxisInterval) {
    this.id = id
    this.interval = interval
  }
}
