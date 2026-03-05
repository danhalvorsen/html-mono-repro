
// packages/core-image/tests/fakes/FakeImageBuilder.ts

import type { IImageMetadata } from "../../src/common/implementation/Image.Common.js"
import { PixelFormat } from "../../src/common/implementation/Image.Common.js"
import { IFakePixelStore } from "./IFakePixelStore.js"

// ================================================================
// FakeImage
// ================================================================

export type FakeImageConfig = {
  width: number
  height: number
  channels: number
  format: PixelFormat
  metadata?: IImageMetadata
  data: Uint8Array | Float32Array
  store: IFakePixelStore
  defaultPixel: readonly number[]
}

