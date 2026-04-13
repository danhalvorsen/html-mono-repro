export interface ICoordinatePoint {
  readonly x: number;
  readonly y: number;
}

export interface ICoordinateSize {
  readonly width: number;
  readonly height: number;
}

export interface ICoordinateSpace {
  readonly width: number;
  readonly height: number;
}

function validateSpace(space: ICoordinateSpace, name: string): void {
  if (!Number.isFinite(space.width) || space.width <= 0) {
    throw new Error(`${name} width must be greater than zero.`);
  }

  if (!Number.isFinite(space.height) || space.height <= 0) {
    throw new Error(`${name} height must be greater than zero.`);
  }
}

export function mapToSvg(
  storybookCoordinates: ICoordinatePoint,
  storybookSpace: ICoordinateSpace,
  svgSpace: ICoordinateSpace,
): ICoordinatePoint {
  validateSpace(storybookSpace, "Storybook coordinate space");
  validateSpace(svgSpace, "SVG coordinate space");

  return Object.freeze({
    x: (storybookCoordinates.x / storybookSpace.width) * svgSpace.width,
    y: (storybookCoordinates.y / storybookSpace.height) * svgSpace.height,
  });
}

export function mapToStorybook(
  svgCoordinates: ICoordinatePoint,
  svgSpace: ICoordinateSpace,
  storybookSpace: ICoordinateSpace,
): ICoordinatePoint {
  validateSpace(svgSpace, "SVG coordinate space");
  validateSpace(storybookSpace, "Storybook coordinate space");

  return Object.freeze({
    x: (svgCoordinates.x / svgSpace.width) * storybookSpace.width,
    y: (svgCoordinates.y / svgSpace.height) * storybookSpace.height,
  });
}

export function mapSizeToSvg(
  storybookSize: ICoordinateSize,
  storybookSpace: ICoordinateSpace,
  svgSpace: ICoordinateSpace,
): ICoordinateSize {
  validateSpace(storybookSpace, "Storybook coordinate space");
  validateSpace(svgSpace, "SVG coordinate space");

  return Object.freeze({
    width: (storybookSize.width / storybookSpace.width) * svgSpace.width,
    height: (storybookSize.height / storybookSpace.height) * svgSpace.height,
  });
}

export function mapSizeToStorybook(
  svgSize: ICoordinateSize,
  svgSpace: ICoordinateSpace,
  storybookSpace: ICoordinateSpace,
): ICoordinateSize {
  validateSpace(svgSpace, "SVG coordinate space");
  validateSpace(storybookSpace, "Storybook coordinate space");

  return Object.freeze({
    width: (svgSize.width / svgSpace.width) * storybookSpace.width,
    height: (svgSize.height / svgSpace.height) * storybookSpace.height,
  });
}
