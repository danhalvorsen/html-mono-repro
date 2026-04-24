import { DomainContext } from "./DomainContext.js";
import { Guard } from "./Guard.js";

export abstract class Entity {
  private readonly _id: string;

  protected constructor(id: string) {
    this._id = Guard.notBlank(id, DomainContext.EntityId);
  }

  public get id(): string {
    return this._id;
  }
}
