export class ServerConfig {
  public readonly sourceRoot: string = "";
  public readonly outputRoot: string = "";

  public constructor(init?: Partial<ServerConfig>) {
    Object.assign(this, init);
  }
}