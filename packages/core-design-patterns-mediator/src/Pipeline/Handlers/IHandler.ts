export interface IHandler<TMsg, TResult> {
    handle(ctx: any, msg: TMsg): Promise<TResult>;  
}