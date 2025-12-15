# Select and modifier box

%Box Modeling%
Box modeling is a fundamental 3D modeling technique where a simple primitive shape, typically a cube or "box," is used as a starting point. The artist refines this basic shape by manipulating its vertices, edges, and faces (usually through subdivision and transformation) until the desired design is achieved. 

%Selection Modifiers%
Selection modifiers are tools that allow you to make a sub-object selection (e.g., specific vertices, edges, or faces) in a non-destructive, procedural way. This selection can then be passed up the modifier stack to affect subsequent modifiers, which only operate on the selected components.

Primetives
Classes
I Want a SVGBuilder class implemented in typescript. The builder have following features:
```
WithVertices(reference: SVG)
WithVertices(vertices: Array<{x:number,y:number}>)
```

There must be a SvgShape base class that Rectangle, Circle eihter inhiretance from or implment interface for or get injected into constructor of the given SVG object
- WithVertices(reference: SVG)
- WithVertices(vertices: Array<{x:number,y:number}>) improve markdown

### WithVertices(reference: SVG)
### WithVertices(vertices: Array<{x:number,y:number}>)

### Path and Polygon Shapes 
Using the <path> element The <path> element is the most versatile for creating complex shapes from vertices and edges. d attribute: This attribute contains the drawing instructions.M (move to): Starts a new sub-path at a given coordinate (e.g., M 10 10).L (line to): Draws a straight line from the current point to a new coordinate (e.g., L 50 10).Z (close path): Draws a straight line from the current point back to the starting point of the sub-path, creating a closed shape. Example xml<svg viewBox="0 0 100 100">
  <path d="M 10 10 L 50 10 L 50 50 L 10 50 Z" fill="blue" stroke="black"/>
</svg>
This creates a blue square with a black border, defined by four vertices at \((10,10)\), \((50,10)\), \((50,50)\), and \((10,50)\). Using the <polyline> and <polygon> elements <polyline>: Draws a series of connected straight lines that do not automatically close.<polygon>: Creates a closed shape by automatically connecting the last vertex to the first. Example with <polyline> xml<svg viewBox="0 0 100 100">
  <polyline points="10 10, 50 10, 50 50, 10 50" fill="none" stroke="green"/>
</svg>
This draws an open path similar to a square's three sides, but without the closing line. Example with <polygon> xml<svg viewBox="0 0 100 100">
  <polygon points="10 10, 50 10, 50 50, 10 50" fill="orange" stroke="black"/>
</svg>
This creates a closed, orange-filled square by automatically connecting the last point back to the first. 

# Behaviors
I need an implementation of something I can call a Behavior (interface IBehaviors). The first behavior is an `IShape` interface implemented by the Circle and Rectangle classes. 

interface IBehavior<T> {
   
    OnClickDelegate? : (event: IMouseEvent) => void;
    OnHoverDelegate? : (event: IMouseEvent) => void;    
}

// I want to use the module im building for env. with or without  DOM. Specific //ThreeJS and Pure Dom and HTML5 Canvas

interface IMouseEvent :Event {}

abstract class OnCClickBehavior<T> implements IBehavior<T> {
   
    OnClickDelegate? : (event: IMouseEvent) => void;
    OnHoverDelegate? : (event: IMouseEvent) => void;    
}

The Behavior has an OnClickDelegate that is a function called when the shape is clicked; the function is passed the MouseEvent as a parameter. The Shape class has a draw method that returns a `SVGElement`. The Circle and Rectangle classes implement the draw method to return the appropriate `SVGElement`.

export class ThreeMouseController implements IMouseController {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly raycaster = new THREE.Raycaster();
  private readonly handlers = new Map<MouseEventType, Set<(e: IMouseEvent) => void>>();
  private readonly boundWrappers = new Map<MouseEventType, (ev: Event) => void>();
  private active = false;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
  }

  enable(): void {
    if (this.active) return;
    this.active = true;
    const opts: AddEventListenerOptions = { passive: false };
    const eventTypes: MouseEventType[] = ["pointerdown", "pointermove", "pointerup", "click", "wheel"];
    for (const type of eventTypes) {
      const wrapper = (ev: Event) => this.emit(type, ev as PointerEvent);
      this.boundWrappers.set(type, wrapper);
      this.canvas.addEventListener(type, wrapper, opts);
    }
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;
    for (const [type, wrapper] of this.boundWrappers) {
      this.canvas.removeEventListener(type, wrapper);
    }
    this.boundWrappers.clear();
  }

  #### 
  creating a new svg geometry,  based on SVG primitives, by using composistion three.  I want to use the Composite design pattern  for drawing  new SVGs.  

  1. Circle is a class Circle(radius: number, centerX: number, centerY: number) 

  2. Behavior is an interface IBehavior with OnClickDelegate and OnHoverDelegate and use with a CircleBehavior class that is two independent object that 1 Drawing a Circle and 2) OnCLickBehavior that can be attached to the Circle class, and also any other class that implements  ISHape interface 