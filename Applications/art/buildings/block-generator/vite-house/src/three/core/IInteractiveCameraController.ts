export interface IInteractiveCameraController {
  connect(): void;
  disconnect(): void;
  update(_deltaSeconds: number, _elapsedSeconds: number): void;
}