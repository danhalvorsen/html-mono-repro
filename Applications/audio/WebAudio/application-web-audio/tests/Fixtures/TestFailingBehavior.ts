import type { Result } from "@monorepo/core-design-patterns";
import type { IBehavior, IContextPipeline } from "@monorepo/core-design-patterns-mediator";
import { OnDragMessage, DragPipelineResult } from "../../src";


export class TestFailingBehavior
    implements IBehavior<OnDragMessage, DragPipelineResult, DragPipelineResult> {
    public constructor(
        private readonly behaviorName: string,
        private readonly failureMessage: string
    ) { }

    public async execute(
        _ctx: IContextPipeline,
        _msg: OnDragMessage
    ): Promise<Result<DragPipelineResult, DragPipelineResult>> {
        return {
            isOk(): this is never {
                return false;
            },
            isErr(): this is never {
                return true;
            },
            ok() {
                return { isSome: () => false, isNone: () => true } as never;
            },
            err() {
                return { isSome: () => true, isNone: () => false } as never;
            },
            unwrap(): never {
                throw new Error("Cannot unwrap Ok value of failing result.");
            },
            unwrapErr(): DragPipelineResult {
                return DragPipelineResult.fail(
                    this.behaviorName,
                    this.failureMessage
                );
            },
            unwrapOr(def: DragPipelineResult): DragPipelineResult {
                return def;
            },
            match<U extends {} | null | void>(fn: {
                ok: (val: DragPipelineResult) => U;
                err: (val: DragPipelineResult) => U;
            }): U {
                return fn.err(
                    DragPipelineResult.fail(this.behaviorName, this.failureMessage)
                );
            },
            map<U extends {} | null>(
                _fn: (val: DragPipelineResult) => U
            ) {
                return this as never;
            },
            mapErr<U extends {} | null>(
                fn: (err: DragPipelineResult) => U
            ) {
                return fn(
                    DragPipelineResult.fail(this.behaviorName, this.failureMessage)
                ) as never;
            },
            andThen<U extends {} | null>(
                _fn: (val: DragPipelineResult) => Result<U, DragPipelineResult>
            ) {
                return this as never;
            },
            orElse<F extends {} | null>(
                fn: (err: DragPipelineResult) => Result<DragPipelineResult, F>
            ) {
                return fn(
                    DragPipelineResult.fail(this.behaviorName, this.failureMessage)
                );
            },
            type: Symbol(":err"),
        };
    }
}
