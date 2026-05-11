export abstract class TurtleDomainError extends Error {
  public abstract readonly code: string;

  protected constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}