import type { IImage } from '../implementation/IImage.js';
import type { IImageDecoder } from '../implementation/IImageDecoder.js';
import type { IKernel } from '../implementation/IKernel.js';
import type { PixelFormat, PixelData, IImageMetadata, IImageBuffer, IImageEncoder } from '../implementation/Image.Common.js';
import { IRegionOfInterest } from './IRegionOfInterest.js';

// ================================================================
// Image abstraction (capabilities grouped under Image)
// ================================================================

export namespace ImageAbstractions {
  // ----------------------------
  // Pixel access & views
  // ----------------------------
  export interface IPixelAccessor {
    get(x: number, y: number): readonly number[];
    set(x: number, y: number, pixel: readonly number[]): void;
  }

  export interface IReadOnlyPixelAccessor {
    get(x: number, y: number): readonly number[];
  }

  /** A lightweight view into an image (ROI, channel view, etc.). */
  export interface IImageView extends IReadOnlyImage {
    readonly roi: IRegionOfInterest;
  }

  /** Allows efficient iteration strategies without exposing storage layout. */
  export interface IPixelIterator {
    forEach(callback: (x: number, y: number, pixel: readonly number[]) => void): void;
  }

  // ----------------------------
  // Image construction / cloning
  // ----------------------------
  export interface IImageFactory {
    create(args: {
      width: number;
      height: number;
      format: PixelFormat;
      data?: PixelData; // optional, impl decides allocation
      metadata?: IImageMetadata;
    }): IImage;

    clone(image: IReadOnlyImage): IImage;
  }

  // ----------------------------
  // Image read-only surface (useful for pipelines)
  // ----------------------------
  export interface IReadOnlyImage {
    readonly width: number;
    readonly height: number;
    readonly format: PixelFormat;
    readonly buffer: IImageBuffer;
    readonly metadata?: IImageMetadata;

    getPixel(x: number, y: number): readonly number[];
  }

  // ----------------------------
  // Pipeline / operations
  // ----------------------------
  export namespace Processing {
    export interface IOperation {
      readonly name: string;
      execute(input: IReadOnlyImage): Promise<IImage>;
    }

    export interface IPipeline {
      add(operation: IOperation): this;
      run(image: IReadOnlyImage): Promise<IImage>;
    }

    /** Optional: lets you attach a backend without changing operation code. */
    export interface IComputeBackend {
      readonly name: string;
      run(operation: IOperation, image: IReadOnlyImage): Promise<IImage>;
    }
  }

  // ----------------------------
  // Convolution / kernels
  // ----------------------------
  export namespace Filters {
    export interface IKernelFactory {
      gaussian(sigma: number, radius?: number): IKernel;
      sobelX(): IKernel;
      sobelY(): IKernel;
      sharpen(): IKernel;
    }

    export interface IConvolver {
      convolve(image: IReadOnlyImage, kernel: IKernel): Promise<IImage>;
    }
  }

  // ----------------------------
  // Color conversions
  // ----------------------------
  export namespace Color {
    export interface IConverter {
      readonly name: string;
      convert(pixel: readonly number[]): readonly number[];
    }

    export interface IConverterRegistry {
      get(name: string): IConverter | undefined;
      list(): readonly IConverter[];
    }
  }

  // ----------------------------
  // IO (grouped)
  // ----------------------------
  export namespace IO {
    export interface IDecoder extends IImageDecoder { }
    export interface IEncoder extends IImageEncoder { }

    export interface ICodecRegistry {
      registerDecoder(decoder: IDecoder): void;
      registerEncoder(encoder: IEncoder): void;

      decoderFor(format: string): IDecoder | undefined;
      encoderFor(format: string): IEncoder | undefined;
    }
  }
}
