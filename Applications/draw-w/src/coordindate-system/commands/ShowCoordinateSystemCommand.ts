import type { ICommand } from '@monorepo/core-design-patterns'
import { ShowCoordinateSystemPayload } from '../payloads/ShowCoordinateSystemPayload'

export class ShowCoordinateSystemCommand implements ICommand<ShowCoordinateSystemPayload> {
  readonly name = 'ShowCoordinateSystem'
  readonly payload: ShowCoordinateSystemPayload

  constructor(payload = new ShowCoordinateSystemPayload()) {
    this.payload = payload
  }
}
