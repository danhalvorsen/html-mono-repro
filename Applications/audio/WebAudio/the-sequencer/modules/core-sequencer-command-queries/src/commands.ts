import { ICommand } from "@monorepo/core-design-patterns-cqrs-no-json";
 export class PlayCommand implements ICommand<PlayCommand> {
    public readonly id: string = "play-command";
    public readonly State: "activat" | "deactivate" = "activat";
     message: PlayCommand = new PlayCommand();
}

 export class StopCommand implements ICommand<StopCommand> {
    public readonly id: string = "stop-command";
    public readonly State: "activat" | "deactivate" = "activat";
     message: StopCommand = new StopCommand();
}

