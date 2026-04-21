import type { INotification } from "./INotification.js";
// ======================================================================================
// packages/core-design-patterns-cqrs/src/notification/INotification.ts
// ======================================================================================
import type { INotificationBase } from "./INotificationBase.js";


export class Notification<TMessage extends INotificationBase> implements INotification<TMessage> {
    private readonly _message: TMessage;

    public constructor(message: TMessage) {
        this._message = message;
    }

    public get message(): TMessage {
        return this._message;
    }
}
