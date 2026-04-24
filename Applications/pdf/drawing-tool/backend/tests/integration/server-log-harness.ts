import { Server } from '../../src/server.js';

const [portRaw, saveDirectory] = process.argv.slice(2);

if (!portRaw || !saveDirectory) {
  throw new Error('Expected args: <port> <saveDirectory>');
}

const port = Number.parseInt(portRaw, 10);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid port: ${portRaw}`);
}

const server = new Server(port, { saveDirectory });
void server.start();

let shuttingDown = false;
const shutdown = async (): Promise<void> => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  await server.stop();
};

process.on('SIGTERM', () => {
  void shutdown();
});

process.on('SIGINT', () => {
  void shutdown();
});
