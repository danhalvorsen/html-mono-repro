import { EventCommandBehavior } from "../EventCommandBehavior.js";

export class ClickCommandBehavior extends EventCommandBehavior {
  constructor(
    id: string,
    handler: (evt: PointerEvent) => void
  ) {
    super(id, "click", handler as unknown as (evt: Event) => void);
  }
}
