export interface IPdfRectangleFragment {
  readonly pageNumber: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface IPdfRectangleOverlayWriteRequest {
  readonly sourcePdfPath: string;
  readonly outputPdfPath: string;
  readonly rectangles: readonly IPdfRectangleFragment[];
}
