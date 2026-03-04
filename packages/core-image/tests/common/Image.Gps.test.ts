// packages/core-image/tests/Image.Gps.test.ts

import { describe, it, expect, beforeEach } from "vitest"
import { FakeImage } from "../Fakes/FakeImage.js"
import { ImageGpsFixture } from "../fixtures/ImageGpsFixture.js"
 
describe("Image metadata — GPS", () => {

  let fx: ImageGpsFixture

  beforeEach(() => {
    fx = new ImageGpsFixture()
  })

  it("reads Stavanger coordinates from metadata", () => {

    const img = fx
      .stavanger(FakeImage.builder().withConstantPixel())
      .build()

    const gps = img.metadata!.gps!

    expect(gps.lat).toBeCloseTo(58.969975, 6)
    expect(gps.lon).toBeCloseTo(5.733107, 6)
    expect(gps.alt).toBe(9)

  })

  it("gps is undefined when metadata is missing", () => {

    const img = FakeImage.builder()
      .withMetadata(undefined)
      .withConstantPixel()
      .build()

    expect(img.metadata).toBeUndefined()
    expect(img.metadata?.gps).toBeUndefined()

  })

  it("gps is undefined when metadata exists but gps not present", () => {

    const img = FakeImage.builder()
      .withMetadata({ exif: { Make: "TestCamera" } })
      .withConstantPixel()
      .build()

    expect(img.metadata).toBeDefined()
    expect(img.metadata!.gps).toBeUndefined()

  })

})