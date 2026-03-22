import { IMessage } from "@monorepo/core-design-patterns-mediator";
import { IOnDragMessagePayload } from "../Contracts/IOnDragMessagePayload";

export class OnDragMessage implements IMessage {
    public readonly name = "OnDragMessage";

    public constructor(
        public readonly payload: IOnDragMessagePayload
    ) { }
}
