// Applications/audio/WebAudio/application-web-audio/tests/Vextex/vex.test.ts

import { Vector2 } from "@monorepo/core-math";
import { beforeEach, describe, it } from "vitest";
import { VexLineShapeFixture } from "./Fixtures/VertexLineShapeFixture.js";
import { VexLineShapeVerifier } from "./Verifiers/VexLineShapeVerifier.js";

describe("VexLineShapeAdapter", () => {
  let fixture: VexLineShapeFixture;
  let verify: VexLineShapeVerifier;

  beforeEach(() => {
    fixture = new VexLineShapeFixture();
    verify = new VexLineShapeVerifier(fixture);
  });

  it("should expose stable line identity", () => {
    verify.hasId("vex-line");
  });

  it("should calculate center from start and end vertices", () => {
    verify.hasCenter(new Vector2(150, 120));
  });

  it("should calculate position from minimum vertex coordinates", () => {
    verify.hasPosition(new Vector2(80, 80));
  });

  it("should calculate width and height from vertex delta", () => {
    verify.hasWidth(140);
    verify.hasHeight(80);
  });

  it("should move both vertices when center changes", () => {
    fixture.adapter.setCenter(new Vector2(200, 150));

    verify.startPositionIs(new Vector2(130, 110));
    verify.endPositionIs(new Vector2(270, 190));
    verify.hasCenter(new Vector2(200, 150));
  });

  it("should move both vertices when position changes", () => {
    fixture.adapter.setPosistion(new Vector2(100, 90));

    verify.startPositionIs(new Vector2(100, 90));
    verify.endPositionIs(new Vector2(240, 170));
  });

  it("should update only end x when width changes", () => {
    fixture.adapter.setWidth(200);

    verify.startPositionIs(new Vector2(80, 80));
    verify.endPositionIs(new Vector2(280, 160));
    verify.hasWidth(200);
  });

  it("should update only end y when height changes", () => {
    fixture.adapter.setHeight(120);

    verify.startPositionIs(new Vector2(80, 80));
    verify.endPositionIs(new Vector2(220, 200));
    verify.hasHeight(120);
  });

  it("should update end vertex when size changes", () => {
    fixture.adapter.setSize(300, 50);

    verify.startPositionIs(new Vector2(80, 80));
    verify.endPositionIs(new Vector2(380, 130));
    verify.hasWidth(300);
    verify.hasHeight(50);
  });

  it("should hit test inside start vertex radius", () => {
    verify.hitTestIs(new Vector2(84, 84), true);
  });

  it("should hit test inside end vertex radius", () => {
    verify.hitTestIs(new Vector2(225, 164), true);
  });

  it("should hit test near the line segment", () => {
    verify.hitTestIs(new Vector2(150, 120), true);
  });

  it("should miss when point is outside vertices and line tolerance", () => {
    verify.hitTestIs(new Vector2(20, 20), false);
  });

  it("should ignore invisible start vertex in hit testing", () => {
    const hiddenFixture = new VexLineShapeFixture({
      startVisible: false,
      start: new Vector2(80, 80),
      end: new Vector2(180, 80),
    });

    new VexLineShapeVerifier(hiddenFixture)
      .hitTestIs(new Vector2(80, 89), false);
  });

  it("should render one line and two visible vertices", () => {
    fixture.draw();

    verify.renderedLine(new Vector2(80, 80), new Vector2(220, 160));
    verify.renderedVisibleVertices([
      [80, 80, 10],
      [220, 160, 10],
    ]);
  });

  it("should not render invisible vertices", () => {
    const hiddenFixture = new VexLineShapeFixture({
      startVisible: false,
      endVisible: false,
    });
    const hiddenVerify = new VexLineShapeVerifier(hiddenFixture);

    hiddenFixture.draw();

    hiddenVerify.renderedLine(new Vector2(80, 80), new Vector2(220, 160));
    hiddenVerify.renderedNoVertices();
  });
});