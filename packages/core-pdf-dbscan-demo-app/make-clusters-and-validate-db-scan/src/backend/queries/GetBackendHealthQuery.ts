import type { IQueryBase } from "@monorepo/core-design-patterns-cqrs";

export class GetBackendHealthQuery implements IQueryBase {
}

export interface IBackendHealth {
    readonly status: "ok";
}
