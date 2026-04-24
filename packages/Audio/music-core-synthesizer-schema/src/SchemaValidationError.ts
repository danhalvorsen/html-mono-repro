export class SchemaValidationError extends Error {
	public readonly validationErrors: readonly string[];

	public constructor(message: string, validationErrors: readonly string[]) {
		super(message);
		this.name = "SchemaValidationError";
		this.validationErrors = validationErrors;
	}
}
