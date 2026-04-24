export interface IWatchdogRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}