export const DEFAULT_PDF_PRESENTATION_WIDTH = 900;
export const DEFAULT_PDF_PRESENTATION_HEIGHT = 700;

export const normalizePdfPresenterDimension = (
  dimension: number,
  fallback: number,
): number => {
  if (!Number.isFinite(dimension)) {
    return fallback;
  }

  if (dimension <= 0) {
    return fallback;
  }

  return Math.floor(dimension);
};

export const hasPdfSource = (src: string): boolean => {
  return src.trim().length > 0;
};
