import { IProjectLoader } from "./IProjectLoader.js";

export interface IJsonSchemaValidator<T> {
  validate(input: unknown): T;
}

export interface IProjectMapper<TDocument, TProject> {
  map(document: TDocument): TProject;
}

export class ProjectLoader<TDocument, TProject> implements IProjectLoader<TProject, unknown> {
  public constructor(
    private readonly validator: IJsonSchemaValidator<TDocument>,
    private readonly mapper: IProjectMapper<TDocument, TProject>,
  ) {}

  public load(input: unknown): TProject {
    const dto = this.validator.validate(input);
    return this.mapper.map(dto);
  }
}