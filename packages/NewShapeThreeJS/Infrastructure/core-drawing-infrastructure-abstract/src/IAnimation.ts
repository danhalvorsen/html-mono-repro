// export interface IDrawingSurface<
//   TShape,
//   TDrawContext extends IDrawContext
// > extends IShapeCollection<TShape>, IRenderInvalidation {
//   readonly viewport: IViewport
//   readonly camera: ICamera
//   getDrawContext(): TDrawContext
//   render(): void
// }
export interface IAnimation {

  readonly isComplete: boolean;

  update(deltaTime: number): void;

  reset(): void;

}
