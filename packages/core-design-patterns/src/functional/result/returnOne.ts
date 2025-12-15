export interface IResult<T> {
    readonly isSuccess: boolean;
    readonly error?: string | null;
    readonly value?: T | null;

    throwIfFailure(): void;
}

export class Result<T> implements IResult<T> {
    readonly isSuccess: boolean = false;
    readonly error: string | null = null;
    readonly value: T | null = null;

    private constructor(
        isSuccess: boolean,
        error: string | null = null,
        value: T | null = null
    ) {
        this.isSuccess = isSuccess;
        this.error = error;
        this.value = value;
    }

    throwIfFailure(): void {
        if (!this.isSuccess) {
            throw new Error(this.error ?? "Unknown error");
        }
    }

    //
    // Static Factory: Success
    //
    static Success<T>(value: T): Result<T> {
        if (value === null || value === undefined) {
            throw new Error("Success value must not be null.");
        }
        return new Result<T>(true, null, value);
    }

    //
    // Static Factory: Failure
    //
    static Failure<T = never>(error: string): Result<T> {
        if (!error || error.trim().length === 0) {
            throw new Error("Error message must be provided.");
        }
        return new Result<T>(false, error, null);
    }

    //
    // Fluent chaining
    //
    then<U>(fn: (value: T) => Result<U>): Result<U> {
        if (!this.isSuccess) {
            return Result.Failure<U>(this.error ?? "Unknown error");
        }
        return fn(this.value as T);
    }
}
