import type { ICommand } from '@monorepo/core-design-patterns'
import { HideCoordinateSystemPayload } from '../payloads/HideCoordinateSystemPayload'

export class HideCoordinateSystemCommand implements ICommand<HideCoordinateSystemPayload> {
  readonly name = 'HideCoordinateSystem'
  readonly payload: HideCoordinateSystemPayload

  constructor(payload = new HideCoordinateSystemPayload()) {
    this.payload = payload
  }
}
