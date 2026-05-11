import { describe, expect, it } from "vitest";
import {
  BlaQuery,
  CqrsIocDispatcherFixture,
  FooCommand,
} from "./fixtures/CqrsIocDispatcherFixture.js";

describe("CQRS dispatcher stress tests using IoC", () => {
  it("dispatches 10 000 sequential requests without losing deterministic results", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    let commandCount = 0;
    let queryCount = 0;
    let lastHandlerInstanceId = 0;

    for (let index = 0; index < 10_000; index++) {
      if (index % 4 === 0) {
        const result = await Dispatcher.Dispatch(new BlaQuery(`stress-${index}`));

        queryCount++;
        lastHandlerInstanceId = result.HandlerInstanceId;

        expect(result.Name).toBe(`STRESS-${index}`);
      } else {
        const result = await Dispatcher.Dispatch(new FooCommand(index));

        commandCount++;
        lastHandlerInstanceId = result.HandlerInstanceId;

        expect(result.Value).toBe(index + 1);
      }
    }

    expect(commandCount).toBe(7_500);
    expect(queryCount).toBe(2_500);
    expect(lastHandlerInstanceId).toBe(10_000);
  });

  it("dispatches 5 000 parallel requests with unique transient handler instances", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const results = await Promise.all(
      Array.from({ length: 5_000 }, async (_, index) => {
        if (index % 5 === 0) {
          return Dispatcher.Dispatch(new BlaQuery(`stress-${index}`));
        }

        return Dispatcher.Dispatch(new FooCommand(index));
      }),
    );

    expect(results).toHaveLength(5_000);

    const handlerInstanceIds = new Set(
      results.map((result) => result.HandlerInstanceId),
    );

    expect(handlerInstanceIds.size).toBe(5_000);

    const first = results[0];
    const last = results[4_999];

    expect(first).toMatchObject({
      Name: "STRESS-0",
      Message: "Bla:stress-0",
    });

    expect(last).toMatchObject({
      Value: 5_000,
      Message: "Foo:4999",
    });
  }, 20_000);
});