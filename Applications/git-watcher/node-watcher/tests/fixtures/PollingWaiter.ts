export class PollingWaiter {
  public async until(
    condition: () => Promise<boolean>,
    timeoutMs: number,
    failureMessage: string,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (await condition()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(failureMessage);
  }
}
