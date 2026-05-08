export interface ITaskScheduler {
  schedule(delayMs: number, action: () => void): void;
}

