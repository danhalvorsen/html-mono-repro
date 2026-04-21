# node-watcher for.ai.spec.md

## Scope

This contract applies to:
- `src/**`
- `tests/**`

## OOP Rules (Mandatory)

1. No loose business logic functions in module scope.
2. Domain behavior must live in classes with explicit responsibilities.
3. Collaboration must be contract-first via interfaces.
4. Keep orchestration in dedicated application classes, not in free functions.
5. Keep infrastructure concerns behind abstractions.

## Design Constraints

1. Use constructor injection for dependencies.
2. Prefer immutable projection/value objects.
3. Keep single reason to change per class.
4. Avoid primitive obsession for domain concepts.

## Testing Constraints

1. Tests must verify public behavior.
2. Tests must remain deterministic.
3. Use shared fixtures for repeated setup.
4. Keep each test focused on one behavior.
