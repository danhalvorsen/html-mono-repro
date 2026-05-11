import { describe, expect, it } from "vitest";
import {
  BlaQuery,
  CqrsIocDispatcherFixture,
  FooCommand,
} from "./fixtures/CqrsIocDispatcherFixture.js";

describe("CQRS dispatcher integration using IoC", () => {
  it("dispatches FooCommand through transient FooCommandHandler", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const result = await Dispatcher.Dispatch(new FooCommand(41));

    expect(result).toEqual({
      Value: 42,
      HandlerInstanceId: 1,
      Message: "Foo:41",
    });
  });

  it("dispatches BlaQuery through transient BlaQueryHandler", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const result = await Dispatcher.Dispatch(new BlaQuery("bla"));

    expect(result).toEqual({
      Name: "BLA",
      HandlerInstanceId: 1,
      Message: "Bla:bla",
    });
  });

  it("resolves a new transient handler instance per dispatch", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const first = await Dispatcher.Dispatch(new FooCommand(1));
    const second = await Dispatcher.Dispatch(new FooCommand(2));
    const third = await Dispatcher.Dispatch(new BlaQuery("x"));

    expect(first.HandlerInstanceId).toBe(1);
    expect(second.HandlerInstanceId).toBe(2);
    expect(third.HandlerInstanceId).toBe(3);
  });

  it("keeps command and query dispatch deterministic", async () => {
    const fixture = new CqrsIocDispatcherFixture();
    const { Dispatcher } = fixture.createSystem();

    const commandResult = await Dispatcher.Dispatch(new FooCommand(9));
    const queryResult = await Dispatcher.Dispatch(new BlaQuery("abc"));

    expect(commandResult.Value).toBe(10);
    expect(commandResult.Message).toBe("Foo:9");

    expect(queryResult.Name).toBe("ABC");
    expect(queryResult.Message).toBe("Bla:abc");
  });
});