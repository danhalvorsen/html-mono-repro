// Applications/audio/WebAudio/application-web-audio/tests/DragController.test.ts

import { beforeEach, describe, expect, it } from "vitest";

import { DragControllerFixture } from "./Fixtures/DragControllerFixture.js";

describe("DragController", () => {
  let fixture: DragControllerFixture;

  beforeEach(() => {
    fixture = new DragControllerFixture();
  });

  it("should register itself on the reactive host", () => {
    expect(fixture.host.hasController(fixture.controller)).toBe(true);
  });
});