import { EventCommandBehavior } from "./EventCommandBehavior.js";

export class ClickCommandBehavior extends EventCommandBehavior {
  constructor(
    id: string,
    handler: (evt: unknown) => void
  ) {
    super(id, "click", handler);
  }
}
