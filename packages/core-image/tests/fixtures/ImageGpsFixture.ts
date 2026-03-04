// packages/core-image/tests/fixtures/ImageGpsFixture.ts

import { IGpsMetadata } from "core-image/src/index.js"
import { FakeImage } from "../Fakes/FakeImage.js"

export interface IImageBuilder {
  withMetadata(metadata: unknown): this
  build(): unknown
}

/**
 * Provides domain test scenarios.
 * Open for extension (new scenarios), closed for modification.
 */
export class ImageGpsFixture {

  static readonly STAVANGER: IGpsMetadata = {
    lat: 58.969975,
    lon: 5.733107,
    alt: 9
  }

  static readonly BERGEN: IGpsMetadata = {
    lat: 60.391263,
    lon: 5.322054
  }

  /**
   * Applies Stavanger GPS to any image builder.
   */
  stavanger(builder: ReturnType<typeof FakeImage.builder>) {
    return builder.withMetadata({
      gps: ImageGpsFixture.STAVANGER
    })
  }

  /**
   * Applies Bergen GPS to any image builder.
   */
  bergen(builder: ReturnType<typeof FakeImage.builder>) {
    return builder.withMetadata({
      gps: ImageGpsFixture.BERGEN
    })
  }

}