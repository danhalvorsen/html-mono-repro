import type { IQuery } from '@monorepo/core-design-patterns'
import { IsCoordinateSystemVisiblePayload } from '../payloads/IsCoordinateSystemVisiblePayload'

export class IsCoordinateSystemVisibleQuery implements IQuery<IsCoordinateSystemVisiblePayload> {
  readonly name = 'IsCoordinateSystemVisible'
  readonly payload: IsCoordinateSystemVisiblePayload

  constructor(payload = new IsCoordinateSystemVisiblePayload()) {
    this.payload = payload
  }
}
