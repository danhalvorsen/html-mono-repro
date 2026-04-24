export interface IGitWatchdog {
  start(): Promise<void>;
  stop(): Promise<void>;
}