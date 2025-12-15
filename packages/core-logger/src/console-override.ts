// src/console-override.ts

const originalLog = console.log;

console.log = (msg: unknown, ...rest: unknown[]) => {
  const formatted = String(msg);
  originalLog(formatted, ...rest);
};
