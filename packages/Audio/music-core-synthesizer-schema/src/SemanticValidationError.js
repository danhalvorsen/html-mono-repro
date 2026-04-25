export class SemanticValidationError extends Error {
    validationErrors;
    constructor(message, validationErrors) {
        super(message);
        this.name = "SemanticValidationError";
        this.validationErrors = validationErrors;
    }
}
//# sourceMappingURL=SemanticValidationError.js.map