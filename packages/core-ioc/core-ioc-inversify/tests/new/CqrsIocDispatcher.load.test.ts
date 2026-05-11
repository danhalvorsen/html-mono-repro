import { describe, expect, it } from "vitest";
import {
  BlaQuery,
  CqrsIocDispatcherFixture,
  FooCommand,
} from "./fixtures/CqrsIocDispatcherFixture.js";

describe("CQRS dispatcher load tests using IoC", () => {
  it("dispatches 1 000 sequential commands and queries deterministically", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const results: number[] = [];

    for (let index = 0; index < 1_000; index++) {
      if (index % 2 === 0) {
        const result = await Dispatcher.Dispatch(new FooCommand(index));
        results.push(result.Value);
      } else {
        const result = await Dispatcher.Dispatch(new BlaQuery(`q${index}`));
        results.push(result.Name.length);
      }
    }

    expect(results).toHaveLength(1_000);
    expect(results[0]).toBe(1);
    expect(results[1]).toBe(2);
    expect(results[998]).toBe(999);
    expect(results[999]).toBe(4);
  });

  it("dispatches 1 000 parallel requests through transient handlers", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const results = await Promise.all(
      Array.from({ length: 1_000 }, async (_, index) => {
        if (index % 2 === 0) {
          return Dispatcher.Dispatch(new FooCommand(index));
        }

        return Dispatcher.Dispatch(new BlaQuery(`q${index}`));
      }),
    );

    expect(results).toHaveLength(1_000);

    const commandResults = results.filter((result): result is {
      readonly Value: number;
      readonly HandlerInstanceId: number;
      readonly Message: string;
    } => "Value" in result);

    const queryResults = results.filter((result): result is {
      readonly Name: string;
      readonly HandlerInstanceId: number;
      readonly Message: string;
    } => "Name" in result);

    expect(commandResults).toHaveLength(500);
    expect(queryResults).toHaveLength(500);

    expect(commandResults[0]?.Value).toBe(1);
    expect(commandResults[499]?.Value).toBe(999);

    expect(queryResults[0]?.Name).toBe("Q1");
    expect(queryResults[499]?.Name).toBe("Q999");

    const handlerInstanceIds = new Set(
      results.map((result) => result.HandlerInstanceId),
    );

    expect(handlerInstanceIds.size).toBe(1_000);
  });
});