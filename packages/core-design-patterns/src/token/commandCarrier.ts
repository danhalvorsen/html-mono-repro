
export type CommandHandler<TCommand, TResponse> =
    (cmd: TCommand) => Promise<TResponse>;

export abstract class CommandBase<TResponse> {
    protected abstract readonly handler: CommandHandler<this, TResponse>;

    public execute(): Promise<TResponse> {
        return this.handler(this);
    }
}