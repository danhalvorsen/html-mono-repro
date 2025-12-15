// demo.ts — simple runtime check for LoggerProvider

import { LoggerProvider } from "./src/LoggerProvider.js";

const log = LoggerProvider.create("Demo");

log.info("System starting with PID {pid}", { pid: process.pid });
log.debug("Debug value: {value}", { value: 42 });
log.warn("Low memory warning at {usage}%", { usage: 78 });
log.error("Unhandled exception: {error}", { error: new Error("Crash!") })