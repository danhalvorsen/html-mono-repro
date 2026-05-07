import path from "node:path";

export class NodePathAdapter {
  resolve(value) {
    return path.resolve(process.cwd(), value);
  }
}