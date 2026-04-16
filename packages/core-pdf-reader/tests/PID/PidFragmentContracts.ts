export interface IPidFontInformation {
  readonly name: string;
  readonly size: number;
  readonly family?: string;
  readonly rawName?: string;
}

export interface IPidFragment {
  readonly pageNumber: number;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly font?: IPidFontInformation;
  readonly fontName?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
}

export interface IPidFragmentsDocument {
  readonly sourcePdf: string;
  readonly generatedAt: string;
  readonly totals: {
    readonly fragments: number;
  };
  readonly fragments: readonly IPidFragment[];
}

export interface IPidFragmentsRepository {
  read(): Promise<IPidFragmentsDocument>;
}
