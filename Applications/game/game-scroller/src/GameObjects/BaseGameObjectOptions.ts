export type BaseGameObjectOptions = {
  readonly rotationRadians: number;
  readonly width: number;
  readonly height: number;
};

export const DefaultBaseGameObjectOptions: BaseGameObjectOptions = {
  rotationRadians: 0,
  width: 1500,
  height: 300,
} as const;
