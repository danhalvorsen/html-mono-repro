export abstract class IocError extends Error {
  public abstract readonly Code: string;

  protected constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}