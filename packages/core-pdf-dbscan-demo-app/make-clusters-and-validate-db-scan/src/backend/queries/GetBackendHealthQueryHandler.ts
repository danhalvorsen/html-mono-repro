import { Ok, type Result } from "@monorepo/core-design-patterns";
import { QueryHandler, type IQuery } from "@monorepo/core-design-patterns-cqrs";
import { GetBackendHealthQuery, type IBackendHealth } from "./GetBackendHealthQuery.js";

export class GetBackendHealthQueryHandler extends QueryHandler<
    GetBackendHealthQuery,
    IBackendHealth,
    string
> {
    public override async handle(
        _query: IQuery<GetBackendHealthQuery>
    ): Promise<Result<IBackendHealth, string>> {
        return Ok({
            status: "ok"
        });
    }
}
