import type { ILogger, LogLevel } from "./ILogger.js";

export class ConsoleLogger implements ILogger {
    private readonly enabled: boolean;

    public constructor(enabled: boolean) {
        this.enabled = enabled;
    }

    public log(level: LogLevel, message: string, data?: unknown): void {
        if (!this.enabled) {
            return;
        }

        const prefix = `[DragSystem] ${message}`;

        switch (level) {
            case "debug":
                console.debug(prefix, data);
                return;
            case "info":
                console.info(prefix, data);
                return;
            case "warn":
                console.warn(prefix, data);
                return;
        }
    }
}
