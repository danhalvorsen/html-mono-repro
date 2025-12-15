// ============================================================================
// Global Scheduler (microtask-based, same behavior as Lit)
// ============================================================================

export type ScheduledJob = () => void | Promise<void>;
export class GlobalScheduler {
  private static queue: ScheduledJob[] = [];
  private static pending = false;

  static schedule(job: ScheduledJob): void {
    this.queue.push(job);
    if (!this.pending) {
      this.pending = true;
      queueMicrotask(() => this.flush());
    }
  }

  private static async flush() {
    this.pending = false;
    for (const job of this.queue) {
      await job();
    }
    this.queue.length = 0;
  }
}
