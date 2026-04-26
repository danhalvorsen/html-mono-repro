// FILE: src/algorithms/DistortionAlgorithmFactory.ts

import {
  DistortionKind,
  type DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { BitCrushDistortionAlgorithm } from "./BitCrushDistortionAlgorithm.js";
import { BypassDistortionAlgorithm } from "./BypassDistortionAlgorithm.js";
import { FoldbackDistortionAlgorithm } from "./FoldbackDistortionAlgorithm.js";
import { HardClipDistortionAlgorithm } from "./HardClipDistortionAlgorithm.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";
import type { IDistortionAlgorithmFactory } from "./IAlgorithmFactory.js";
import { SoftClipDistortionAlgorithm } from "./SoftClipDistortionAlgorithm.js";
import { TanhDistortionAlgorithm } from "./TanhDistortionAlgorithm.js";

export class DistortionAlgorithmFactory implements IDistortionAlgorithmFactory {
  public create(definition: DistortionDefinition): IDistortionAlgorithm {
    switch (definition.kind) {
      case DistortionKind.Bypass:
        return new BypassDistortionAlgorithm();

      case DistortionKind.HardClip:
        return new HardClipDistortionAlgorithm();

      case DistortionKind.SoftClip:
        return new SoftClipDistortionAlgorithm();

      case DistortionKind.Tanh:
        return new TanhDistortionAlgorithm();

      case DistortionKind.Foldback:
        return new FoldbackDistortionAlgorithm();

      case DistortionKind.BitCrush:
        return new BitCrushDistortionAlgorithm();
    }
  }
}