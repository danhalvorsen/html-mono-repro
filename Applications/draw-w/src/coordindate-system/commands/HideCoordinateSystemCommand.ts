 
import { HideCoordinateSystemPayload } from '../payloads/HideCoordinateSystemPayload'
import type { ICommand } from '@monorepo/core-design-patterns-cqrs'

export class HideCoordinateSystemCommand implements ICommand<HideCoordinateSystemPayload> {
  readonly name = 'HideCoordinateSystem'
  readonly payload: HideCoordinateSystemPayload
  readonly json: string

  constructor(payload = new HideCoordinateSystemPayload()) {
    this.payload = payload
    this.json = JSON.stringify(payload)
  }
}
