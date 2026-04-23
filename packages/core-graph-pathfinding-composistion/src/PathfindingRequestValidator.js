/* =================================================================================================
   Domain validator implementation
   ================================================================================================= */
export class PathfindingRequestValidator {
    validator;
    constructor(validator) {
        this.validator = ValidationGuard.againstNullOrUndefined(validator, "validator");
        Object.freeze(this);
    }
    validate(graph, request) {
        const context = new PathfindingRequestValidationContext(graph, request);
        this.validator.validate(context);
    }
}
//# sourceMappingURL=PathfindingRequestValidator.js.map