export const UI_UPDATE_COMMAND = {
	HttpRequestReceived: 'HttpRequestReceived',
	ServerHandlerStarted: 'ServerHandlerStarted',
	DispatcherInvoked: 'DispatcherInvoked',
	PipelineStageObserved: 'PipelineStageObserved',
	ServerHandlerCompleted: 'ServerHandlerCompleted',
	HttpResponseSent: 'HttpResponseSent',
} as const;

export type UiUpdateCommandName = (typeof UI_UPDATE_COMMAND)[keyof typeof UI_UPDATE_COMMAND];

export type UiUpdateCommand = {
	readonly name: UiUpdateCommandName;
	readonly scope: 'http' | 'command' | 'query';
	readonly stage: string;
	readonly details?: unknown;
};

export interface IUpdateUIBehavoir {
	send(command: UiUpdateCommand): void;
}

export class UpdateUIBehavoir implements IUpdateUIBehavoir {
	public constructor(
		private readonly sender: (command: UiUpdateCommand) => void,
	) {}

	public send(command: UiUpdateCommand): void {
		this.sender(command);
	}
}
