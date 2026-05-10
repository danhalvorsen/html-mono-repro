export class SvgRotationService {
  public rotate(svgText: string, angleDegrees: number): string {
    if (angleDegrees === 0) {
      return svgText;
    }

    const viewBox = this.readViewBox(svgText);
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    return svgText.replace(
      /<svg\b([^>]*)>/iu,
      `<svg$1><g transform="rotate(${angleDegrees} ${centerX} ${centerY})">`,
    ).replace(
      /<\/svg>\s*$/iu,
      "</g></svg>",
    );
  }

  private readViewBox(svgText: string): { readonly x: number; readonly y: number; readonly width: number; readonly height: number } {
    const viewBoxMatch = svgText.match(/\bviewBox\s*=\s*["']([^"']+)["']/iu);

    if (viewBoxMatch?.[1]) {
      const values = viewBoxMatch[1].trim().split(/\s+/u).map(Number);

      if (values.length === 4 && values.every(Number.isFinite)) {
        return {
          x: values[0]!,
          y: values[1]!,
          width: values[2]!,
          height: values[3]!,
        };
      }
    }

    const width = this.readNumberAttribute(svgText, "width", 100);
    const height = this.readNumberAttribute(svgText, "height", 100);

    return {
      x: 0,
      y: 0,
      width,
      height,
    };
  }

  private readNumberAttribute(svgText: string, name: string, fallback: number): number {
    const match = svgText.match(new RegExp(`\\b${name}\\s*=\\s*["']([0-9.]+)["']`, "iu"));
    const value = match?.[1] === undefined ? fallback : Number(match[1]);

    return Number.isFinite(value) ? value : fallback;
  }
}