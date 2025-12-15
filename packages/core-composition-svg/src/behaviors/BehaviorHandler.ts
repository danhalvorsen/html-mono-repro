/**
 * Lightweight generic handler wrapper to keep behavior implementations DRY.
 */
export class BehaviorHandler<TPayload> {
  private readonly handler: (payload: TPayload) => void;

  constructor(handler: (payload: TPayload) => void) {
    this.handler = handler;
  }

  handle(payload: TPayload) {
    this.handler(payload);
  }
}
