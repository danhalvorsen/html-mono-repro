import { expect, test } from "./fixtures/reactive.fixture.js"

test("ControllerHostCore should be dirty on construction", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);

  expect(sut.isDirty).toBe(true);
  expect(sut.controllerCount).toBe(0);
});

test("ControllerHostCore should connect controller and request update when added", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);
  const controller = fixture.createController<typeof host>();

  sut.addController(controller);

  expect(sut.controllerCount).toBe(1);
  expect(sut.isDirty).toBe(true);
  expect(controller.log.connectedHosts).toEqual([host]);
});

test("ControllerHostCore should ignore duplicate controller add", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);
  const controller = fixture.createController<typeof host>();

  sut.addController(controller);
  sut.addController(controller);

  expect(sut.controllerCount).toBe(1);
  expect(controller.log.connectedHosts).toHaveLength(1);
});

test("ControllerHostCore should update connected controllers once per dirty cycle", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);
  const controller = fixture.createController<typeof host>();

  sut.addController(controller);

  const firstResult = sut.updateIfNeeded();
  const secondResult = sut.updateIfNeeded();

  expect(firstResult).toBe(true);
  expect(secondResult).toBe(false);
  expect(sut.isDirty).toBe(false);
  expect(controller.log.updateCount).toBe(1);
});

test("ControllerHostCore should disconnect controller when removed", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);
  const controller = fixture.createController<typeof host>();

  sut.addController(controller);
  sut.updateIfNeeded();
  sut.removeController(controller);

  expect(sut.controllerCount).toBe(0);
  expect(sut.isDirty).toBe(true);
  expect(controller.log.disconnectedCount).toBe(1);
});

test("ControllerHostCore should ignore removal of unknown controller", ({ fixture }) => {
  const host = { name: "host" };
  const sut = fixture.createHostCore(host);
  const controller = fixture.createController<typeof host>();

  sut.removeController(controller);

  expect(sut.controllerCount).toBe(0);
  expect(controller.log.disconnectedCount).toBe(0);
});

test("ReactiveShapeHost should delegate add remove and update to the core", ({ fixture }) => {
  const sut = fixture.createShapeHost();
  const controller = fixture.createController<typeof sut>();

  sut.addController(controller);

  expect(sut.controllerCount).toBe(1);
  expect(sut.isDirty).toBe(true);

  const updated = sut.updateIfNeeded();

  expect(updated).toBe(true);
  expect(sut.isDirty).toBe(false);
  expect(controller.log.connectedHosts).toEqual([sut]);
  expect(controller.log.updateCount).toBe(1);

  sut.removeController(controller);

  expect(sut.controllerCount).toBe(0);
  expect(controller.log.disconnectedCount).toBe(1);
});