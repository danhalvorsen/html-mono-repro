The current app works as a prototype, but it is not yet clean architecture. The main issue is this:

Lit components currently know too much domain.

Examples:

svg-shape-list
  knows shape names
  knows turtle primitive names
  knows game-design-svg template names
  knows command examples

turtle-svg-viewer
  creates TurtleSvgSceneRenderer directly
  owns composition
  depends on concrete renderer construction

TurtleCommandParser
  is moving in the right direction
  still needs stronger typed command contracts and registry composition
My assessment
Priority 1 is valid

These are the most important fixes:

1. Move shape catalog out of UI
2. Move command catalog out of UI
3. Add explicit composition root
4. Inject renderer/parser/services into components
5. Replace shape/command/template strings with typed identifiers

This directly follows your spec:

Domain owns rules.
Application coordinates.
Presentation adapts.
Composition root wires dependencies.
Correct target structure
src
├── domain
│   ├── commands
│   │   ├── TurtleCommandId.ts
│   │   ├── TurtleCommandDescriptor.ts
│   │   ├── TurtleCommandCatalog.ts
│   │   └── TurtleCommandContracts.ts
│   ├── shapes
│   │   ├── ShapeId.ts
│   │   ├── ShapeDescriptor.ts
│   │   ├── ShapeCatalog.ts
│   │   └── ShapeTemplateId.ts
│   └── diagnostics
│       └── Diagnostic.ts
│
├── application
│   ├── TurtleWorkbenchApplicationService.ts
│   ├── ITurtleSceneRenderer.ts
│   ├── ITurtleCommandParser.ts
│   └── IShapeCatalogProvider.ts
│
├── infrastructure
│   ├── DefaultTurtleSceneRenderer.ts
│   ├── DefaultTurtleCommandParser.ts
│   └── StaticShapeCatalogProvider.ts
│
├── composition
│   └── TurtleWorkbenchCompositionRoot.ts
│
└── components
    ├── turtle-workbench.ts
    ├── turtle-command-editor.ts
    ├── turtle-svg-viewer.ts
    ├── svg-shape-list.ts
    └── turtle-command-list.ts
Important correction

This feedback item:

Introduce a TurtleCommandParser interface

is already partly done, but the interface is in the wrong architectural neighborhood if it stays coupled to parser implementation files.

It should be an application contract:

export interface ITurtleCommandParser {
  parse(source: string): TurtleCommandParseResult;
}

Then implementation can live separately:

infrastructure/DefaultTurtleCommandParser.ts
Shape list correction

svg-shape-list should not contain this data directly:

gameDesignSvgTemplate: "SvgRectangle"
turtlePrimitive: "RectanglePrimitive"
commandExample: "brush rectangle"

That belongs in a catalog:

export const ShapeCatalog = [
  {
    id: ShapeId.Rectangle,
    label: "Rectangle",
    templateId: ShapeTemplateId.SvgRectangle,
    turtlePrimitiveId: TurtlePrimitiveId.Rectangle,
    brushCommand: TurtleBrushCommandId.Rectangle,
  },
] as const;

Then the component becomes:

input: readonly ShapeDescriptor[]
output: shape-selected event

No domain decisions.

Composition root is mandatory

This is the biggest structural problem:

private readonly sceneRenderer = new TurtleSvgSceneRenderer();

That should move out of the component.

Target:

const compositionRoot = new TurtleWorkbenchCompositionRoot();

compositionRoot.register();

or simpler for Lit:

const workbenchService = createTurtleWorkbenchApplicationService();

html`
  <turtle-svg-viewer
    .sceneRenderer=${workbenchService.sceneRenderer}
  ></turtle-svg-viewer>
`

The component should not construct the renderer.

What I would do next

Do not refactor everything at once. The clean next slice is:

Slice 1:
  create domain/commands catalog
  create domain/shapes catalog
  remove hardcoded command/shape metadata from components
  keep UI behavior unchanged
  add tests for both catalogs

Then:

Slice 2:
  create TurtleWorkbenchCompositionRoot
  inject TurtleSvgSceneRenderer
  remove direct new TurtleSvgSceneRenderer() from viewer
  add component/application tests

Then:

Slice 3:
  move parser contracts to application layer
  keep parser implementation behind interface
  add BDD parser tests
My verdict

The feedback is technically sound.

But the sequence matters. Do this first:

1. Domain catalogs
2. Composition root
3. Parser interface placement
4. Tests

Do not start with Scene abstraction, CommandFactory, or ShapeFactory yet. Those are valid later, but premature before the domain/application/presentation boundaries are fixed.