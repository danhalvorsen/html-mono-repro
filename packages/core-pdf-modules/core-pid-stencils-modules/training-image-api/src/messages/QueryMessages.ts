import type { IQueryBase } from "@monorepo/core-design-patterns-cqrs-no-json";

export const QueryMessageType = {
  ListSvgFiles: "ListSvgFiles",
  GetGenerationStatus: "GetGenerationStatus",
  GetApiCatalog: "GetApiCatalog",
} as const;

export type QueryMessageType =
  typeof QueryMessageType[keyof typeof QueryMessageType];

export interface ListSvgFilesQueryMessage extends IQueryBase {
  readonly type: typeof QueryMessageType.ListSvgFiles;
  readonly sourceDirectory: string;
}

export interface GetGenerationStatusQueryMessage extends IQueryBase {
  readonly type: typeof QueryMessageType.GetGenerationStatus;
}

export interface GetApiCatalogQueryMessage extends IQueryBase {
  readonly type: typeof QueryMessageType.GetApiCatalog;
}

export type QueryMessage =
  | ListSvgFilesQueryMessage
  | GetGenerationStatusQueryMessage
  | GetApiCatalogQueryMessage;