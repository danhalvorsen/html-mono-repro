import type { ICommand } from '@monorepo/core-design-patterns'
import { PlotPointsPayload } from '../payloads/PlotPointsPayload'

export class PlotCommand implements ICommand<PlotPointsPayload> {
  readonly name = 'Plot'
  readonly payload: PlotPointsPayload

  constructor(payload: PlotPointsPayload) {
    this.payload = payload
  }
}
