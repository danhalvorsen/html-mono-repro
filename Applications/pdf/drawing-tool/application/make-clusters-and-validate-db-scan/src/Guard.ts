/* =================================================================================================
   Guards
   ================================================================================================= */
export class Guard {
    public static againstNull<T>(value: T | null | undefined, name: string): void {
        if (value === null || value === undefined) {
            throw new Error(`${name} must not be null or undefined.`);
        }
    }
    public static againstNullOrWhitespace(value: string, name: string): void {
        if (value === null || value === undefined || value.trim().length === 0) {
            throw new Error(`${name} must not be null, undefined, or whitespace.`);
        }
    }
    public static againstNonPositiveNumber(value: number, name: string): void {
        if (!Number.isFinite(value) || value <= 0) {
            throw new Error(`${name} must be a finite number greater than zero.`);
        }
    }
    public static againstNegativeNumber(value: number, name: string): void {
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`${name} must be a finite number greater than or equal to zero.`);
        }
    }
}
