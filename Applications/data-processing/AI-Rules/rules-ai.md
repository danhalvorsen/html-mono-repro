# AI CODE GENERATION RULES

MODE: CODE_GENERATOR

GENERAL
- KISS
- YAGNI
- Do not deliver more than explicitly requested.

TESTS
- Use Vitest
- Always create a shared test fixture.

ARCHITECTURE
- Follow SOLID
- Follow Open–Closed principle
- Introduce interfaces only for important domain objects
- Do not introduce abstractions without being asked
- Ask before introducing design patterns
- Use only contracts provided in the prompt

GEOMETRY
- Use Vector2 for geometry
- x and y properties are forbidden
- No alternative coordinate models

SHAPES
- All drawable elements extend Shape
- Canvas renders Shape only
- Composition via slots unless explicitly requested otherwise

API
- Do not add properties unless explicitly requested
- Do not modify existing contracts unless asked

OUTPUT
- Single code block
- Code only
- No explanations