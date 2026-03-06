 
import { IsCoordinateSystemVisiblePayload } from '../payloads/IsCoordinateSystemVisiblePayload'
import type { IQuery } from '@monorepo/core-design-patterns-cqrs'

export class IsCoordinateSystemVisibleQuery implements IQuery<IsCoordinateSystemVisiblePayload> {
  readonly name = 'IsCoordinateSystemVisible'
  readonly payload: IsCoordinateSystemVisiblePayload
  readonly json: string

  constructor(payload = new IsCoordinateSystemVisiblePayload()) {
    this.payload = payload
    this.json = JSON.stringify(payload)
  }
}
