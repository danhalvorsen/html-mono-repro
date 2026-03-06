export interface IReactiveController<THost> {
  hostConnected?(host: THost): void;
  hostDisconnected?(): void;
  hostUpdate?(): void;
  dispose?(): void
}