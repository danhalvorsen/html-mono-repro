import type { ICommand } from '@monorepo/core-design-patterns-cqrs'
import { PlotPointsPayload } from '../payloads/PlotPointsPayload'

export class PlotCommand implements ICommand<PlotPointsPayload> {
  readonly name = 'Plot'
  readonly payload: PlotPointsPayload
  readonly json: string

  constructor(payload: PlotPointsPayload) {
    this.payload = payload
    this.json = JSON.stringify(payload)
  }
}
