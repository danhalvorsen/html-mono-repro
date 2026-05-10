export interface GameObjectColorStop {
  readonly position: number;
  readonly colorCss: string;
}

export interface GameObjectColorTheme {
  readonly name: string;
  readonly backgroundCss: string;
  readonly foregroundCss: string;
  readonly accentCss: string;
  readonly shadowCss: string;
  readonly opacity: number;
  readonly gradientStops: readonly GameObjectColorStop[];
  readonly paletteCss: readonly string[];
}

export interface IColorManagedGameObject {
  applyColorTheme(theme: GameObjectColorTheme): void;
}