import { describe, expect, it } from "vitest";

import { EventBusFixture } from "./fixtures/EventBusFixture.js";

describe("EventBus", () => {
  const fx = new EventBusFixture();

  it("publishes an event to every registered notification handler", async () => {
    const handlerA = fx.handler();
    const handlerB = fx.handler();
    const bus = fx.bus(handlerA, handlerB);
    const event = fx.event();

    await bus.publish(event);

    expect(handlerA.events).toEqual([event]);
    expect(handlerB.events).toEqual([event]);
  });
});
