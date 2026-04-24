import { Err, Ok, type Result } from '@monorepo/core-design-patterns';
import {
	type IBehavior,
	type IBehaviorResult,
	type IContextPipeline,
	type IMessage,
} from '@monorepo/core-design-patterns-mediator';

type PerformanceScope = 'command' | 'query';

export type PerformanceStartPayload = {
	readonly scope: PerformanceScope;
	readonly stage: 'performance.start';
	readonly details?: unknown;
};

export class MessurePerformanceBehavior<
	TMessage extends IMessage,
	TContext extends IContextPipeline,
	TOk extends IBehaviorResult,
	TError extends IBehaviorResult,
> implements IBehavior<TMessage, TOk, TError> {
	public constructor(
		private readonly startSymbol: symbol,
		private readonly createOkResult: () => TOk,
		private readonly emitStart: (ctx: TContext, payload: PerformanceStartPayload) => Promise<void>,
		private readonly scope: PerformanceScope,
	) {}

	public async execute(
		ctx: IContextPipeline,
		_msg: TMessage,
	): Promise<Result<TOk, TError>> {
		ctx.set(this.startSymbol, Date.now());
		await this.emitStart(ctx as TContext, {
			scope: this.scope,
			stage: 'performance.start',
			details: { message: 'Stopwatch started.' },
		});

		return Ok(this.createOkResult());
	}
}

type ValidationScope = 'command' | 'query';

type ValidationEmitPayload = {
	readonly scope: ValidationScope;
	readonly stage: 'validation.ok' | 'validation.error';
	readonly ok?: boolean;
	readonly status?: number;
	readonly message?: string;
	readonly details?: unknown;
};

type ValidationErrorDescriptor = {
	readonly status: number;
	readonly message: string;
	readonly reason: string;
};

export class ValidateTypeAndPayloadBehavior<
	TMessage extends IMessage,
	TContext extends IContextPipeline,
	TPayload,
	TOk extends IBehaviorResult,
	TError extends IBehaviorResult,
> implements IBehavior<TMessage, TOk, TError> {
	public constructor(
		private readonly scope: ValidationScope,
		private readonly getType: (msg: TMessage) => string,
		private readonly getPayload: (msg: TMessage) => unknown,
		private readonly isSupportedType: (normalizedType: string) => boolean,
		private readonly unsupportedTypeError: ValidationErrorDescriptor,
		private readonly isValidPayload: (payload: unknown) => payload is TPayload,
		private readonly invalidPayloadError: ValidationErrorDescriptor,
		private readonly setValidatedPayload: (ctx: TContext, payload: TPayload) => void,
		private readonly createOkResult: () => TOk,
		private readonly createError: (status: number, reason: string) => TError,
		private readonly emit: (ctx: TContext, payload: ValidationEmitPayload) => Promise<void>,
	) {}

	public async execute(
		ctx: IContextPipeline,
		msg: TMessage,
	): Promise<Result<TOk, TError>> {
		const normalizedType = this.getType(msg).trim().toLowerCase();
		if (!this.isSupportedType(normalizedType)) {
			await this.emit(ctx as TContext, {
				scope: this.scope,
				stage: 'validation.error',
				status: this.unsupportedTypeError.status,
				message: this.unsupportedTypeError.message,
			});
			return Err(this.createError(this.unsupportedTypeError.status, this.unsupportedTypeError.reason));
		}

		const payload = this.getPayload(msg);
		if (!this.isValidPayload(payload)) {
			await this.emit(ctx as TContext, {
				scope: this.scope,
				stage: 'validation.error',
				status: this.invalidPayloadError.status,
				message: this.invalidPayloadError.message,
			});
			return Err(this.createError(this.invalidPayloadError.status, this.invalidPayloadError.reason));
		}

		this.setValidatedPayload(ctx as TContext, payload);
		await this.emit(ctx as TContext, {
			scope: this.scope,
			stage: 'validation.ok',
			ok: true,
			details: { type: normalizedType },
		});

		return Ok(this.createOkResult());
	}
}
