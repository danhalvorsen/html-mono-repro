import type { ReferenceCurveRenderStyle } from '../../Elements/Polygon/MultiCurveSvgTemplate.js';

export interface CaveViewportOptions {
  readonly width?: number;
  readonly height?: number;
  readonly showCameraViewBox: boolean;
}

export interface CaveRenderOptions {
  readonly showReferenceCurve: boolean;
  readonly referenceCurveRenderStyle: ReferenceCurveRenderStyle;
  readonly closeUpperLowerToBounds: boolean;
}

export interface CaveCurveOptions {
  readonly preset: string;
}

export interface CaveNoiseOptions {
  readonly materialOptionsUrl: string;
  readonly reloadIntervalMs: number;
  readonly materialOptions: CaveNoiseMaterialOptions;
}

export interface CaveNoiseMaterialOptions {
  readonly patternInset: number;
  readonly upper: CaveNoiseLayerOptions;
  readonly lower: CaveNoiseLayerOptions;
}

export interface CaveNoiseLayerOptions {
  readonly baseFrequency: CaveNoiseFrequencyOptions;
  readonly numOctaves: number;
  readonly seed: number;
  readonly blurStdDeviation: number;
  readonly baseFill: string;
  readonly overlayOpacity: number;
}

export interface CaveNoiseFrequencyOptions {
  readonly x: number;
  readonly y: number;
}

export class CaveViewportOptionsValue implements CaveViewportOptions {
  public constructor(
    public readonly width: number | undefined,
    public readonly height: number | undefined,
    public readonly showCameraViewBox: boolean
  ) {}

  public static createDefault(): CaveViewportOptionsValue {
    return new CaveViewportOptionsValue(undefined, undefined, false);
  }

  public withWidth(width: number | undefined): CaveViewportOptionsValue {
    return new CaveViewportOptionsValue(width, this.height, this.showCameraViewBox);
  }

  public withHeight(height: number | undefined): CaveViewportOptionsValue {
    return new CaveViewportOptionsValue(this.width, height, this.showCameraViewBox);
  }

  public withShowCameraViewBox(showCameraViewBox: boolean): CaveViewportOptionsValue {
    return new CaveViewportOptionsValue(this.width, this.height, showCameraViewBox);
  }
}

export class CaveRenderOptionsValue implements CaveRenderOptions {
  public constructor(
    public readonly showReferenceCurve: boolean,
    public readonly referenceCurveRenderStyle: ReferenceCurveRenderStyle,
    public readonly closeUpperLowerToBounds: boolean
  ) {}

  public static createDefault(): CaveRenderOptionsValue {
    return new CaveRenderOptionsValue(true, 'solid', true);
  }

  public withShowReferenceCurve(showReferenceCurve: boolean): CaveRenderOptionsValue {
    return new CaveRenderOptionsValue(
      showReferenceCurve,
      this.referenceCurveRenderStyle,
      this.closeUpperLowerToBounds
    );
  }

  public withReferenceCurveRenderStyle(
    referenceCurveRenderStyle: ReferenceCurveRenderStyle
  ): CaveRenderOptionsValue {
    return new CaveRenderOptionsValue(
      this.showReferenceCurve,
      referenceCurveRenderStyle,
      this.closeUpperLowerToBounds
    );
  }

  public withCloseUpperLowerToBounds(closeUpperLowerToBounds: boolean): CaveRenderOptionsValue {
    return new CaveRenderOptionsValue(
      this.showReferenceCurve,
      this.referenceCurveRenderStyle,
      closeUpperLowerToBounds
    );
  }
}

export class CaveCurveOptionsValue implements CaveCurveOptions {
  public constructor(public readonly preset: string) {}

  public static createDefault(): CaveCurveOptionsValue {
    return new CaveCurveOptionsValue('default');
  }
}

export class CaveNoiseFrequencyOptionsValue implements CaveNoiseFrequencyOptions {
  public constructor(
    public readonly x: number,
    public readonly y: number
  ) {}
}

export class CaveNoiseLayerOptionsValue implements CaveNoiseLayerOptions {
  public constructor(
    public readonly baseFrequency: CaveNoiseFrequencyOptions,
    public readonly numOctaves: number,
    public readonly seed: number,
    public readonly blurStdDeviation: number,
    public readonly baseFill: string,
    public readonly overlayOpacity: number
  ) {}
}

export class CaveNoiseMaterialOptionsValue implements CaveNoiseMaterialOptions {
  public constructor(
    public readonly patternInset: number,
    public readonly upper: CaveNoiseLayerOptions,
    public readonly lower: CaveNoiseLayerOptions
  ) {}

  public static createDefault(): CaveNoiseMaterialOptionsValue {
    return new CaveNoiseMaterialOptionsValue(
      0.02,
      new CaveNoiseLayerOptionsValue(
        new CaveNoiseFrequencyOptionsValue(0.12, 0.18),
        4,
        11,
        0,
        '#3b271b',
        1
      ),
      new CaveNoiseLayerOptionsValue(
        new CaveNoiseFrequencyOptionsValue(0.1, 0.15),
        4,
        19,
        0,
        '#2e1f15',
        1
      )
    );
  }
}

export class CaveNoiseOptionsValue implements CaveNoiseOptions {
  public constructor(
    public readonly materialOptionsUrl: string,
    public readonly reloadIntervalMs: number,
    public readonly materialOptions: CaveNoiseMaterialOptions
  ) {}

  public static createDefault(): CaveNoiseOptionsValue {
    return new CaveNoiseOptionsValue(
      '/cave-noise-material.json',
      0,
      CaveNoiseMaterialOptionsValue.createDefault()
    );
  }

  public withMaterialOptions(
    materialOptions: CaveNoiseMaterialOptions
  ): CaveNoiseOptionsValue {
    return new CaveNoiseOptionsValue(
      this.materialOptionsUrl,
      this.reloadIntervalMs,
      materialOptions
    );
  }

  public withMaterialOptionsUrl(materialOptionsUrl: string): CaveNoiseOptionsValue {
    return new CaveNoiseOptionsValue(
      materialOptionsUrl,
      this.reloadIntervalMs,
      this.materialOptions
    );
  }

  public withReloadIntervalMs(reloadIntervalMs: number): CaveNoiseOptionsValue {
    return new CaveNoiseOptionsValue(
      this.materialOptionsUrl,
      reloadIntervalMs,
      this.materialOptions
    );
  }
}

export class MergeCaveNoiseLayerOptions {
  public merge(
    fallback: CaveNoiseLayerOptions,
    loaded: Partial<CaveNoiseLayerOptions> | null | undefined
  ): CaveNoiseLayerOptionsValue {
    return new CaveNoiseLayerOptionsValue(
      loaded?.baseFrequency ?? fallback.baseFrequency,
      loaded?.numOctaves ?? fallback.numOctaves,
      loaded?.seed ?? fallback.seed,
      loaded?.blurStdDeviation ?? fallback.blurStdDeviation,
      loaded?.baseFill ?? fallback.baseFill,
      loaded?.overlayOpacity ?? fallback.overlayOpacity
    );
  }
}

export class MergeCaveNoiseMaterialOptions {
  public constructor(
    private readonly layerMerger: MergeCaveNoiseLayerOptions =
      new MergeCaveNoiseLayerOptions()
  ) {}

  public merge(
    fallback: CaveNoiseMaterialOptions,
    loaded: Partial<CaveNoiseMaterialOptions> | null | undefined
  ): CaveNoiseMaterialOptionsValue {
    return new CaveNoiseMaterialOptionsValue(
      loaded?.patternInset ?? fallback.patternInset,
      this.layerMerger.merge(fallback.upper, loaded?.upper),
      this.layerMerger.merge(fallback.lower, loaded?.lower)
    );
  }
}
