import type { ICommand } from '@monorepo/core-design-patterns-cqrs'
import { ShowCoordinateSystemPayload } from '../payloads/ShowCoordinateSystemPayload'

export class ShowCoordinateSystemCommand implements ICommand<ShowCoordinateSystemPayload> {
  readonly name = 'ShowCoordinateSystem'
  readonly payload: ShowCoordinateSystemPayload
  readonly json: string

  constructor(payload = new ShowCoordinateSystemPayload()) {
    this.payload = payload
    this.json = JSON.stringify(payload)
  }
}
