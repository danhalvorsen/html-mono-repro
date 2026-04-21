 
export abstract class Entity {
  private readonly _id: string;

  protected constructor(id: string) {
    if (id.trim().length === 0) {
      throw new Error("Entity id is required.");
    }

    this._id = id;
  }

  public get id(): string {
    return this._id;
  }
}
