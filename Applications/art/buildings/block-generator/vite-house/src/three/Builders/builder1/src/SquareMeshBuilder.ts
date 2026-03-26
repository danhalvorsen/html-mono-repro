
import * as THREE from "three";
import {type  ISquare, type SquareSemantic, Square } from "./Square.js"
 
interface ISquareBuilderState {
  readonly current: ISquare | null;
  readonly parentWorld: THREE.Matrix4;
}

export class SquareMeshBuilder {
  private readonly positions: number[] = [];
  private readonly normals: number[] = [];
  private readonly uvs: number[] = [];
  private readonly indices: number[] = [];

  private readonly stack: ISquareBuilderState[] = [];
  private state: ISquareBuilderState;

  public constructor() {
    this.state = {
      current: null,
      parentWorld: new THREE.Matrix4().identity(),
    };
  }

  public with(): SquareMeshBuilder;
  public with(x: number, y: number): SquareMeshBuilder;
  public with(x?: number, y?: number): SquareMeshBuilder {
    const localMatrix = new THREE.Matrix4().makeTranslation(x ?? 0, y ?? 0, 0);
    const square = new Square(localMatrix);

    square.updateWorld(this.state.parentWorld);
    this.appendSquare(square);

    this.state = {
      ...this.state,
      current: square,
    };

    return this;
  }

  public withSemantic(semantic: SquareSemantic): SquareMeshBuilder {
    if (this.state.current === null) {
      throw new Error("withSemantic() requires an existing square. Call with() first.");
    }

    const current = this.state.current;
    const targetWorldAnchor = current.getWorldAnchor(semantic);
    const oppositeSemantic = this.getOppositeSemantic(semantic);

    const newSquareLocalAnchor = new Square().getLocalAnchor(oppositeSemantic);
    const newCenterWorld = targetWorldAnchor.clone().sub(newSquareLocalAnchor);

    const localMatrix = new THREE.Matrix4().makeTranslation(
      newCenterWorld.x,
      newCenterWorld.y,
      newCenterWorld.z,
    );

    const square = new Square(localMatrix);
    square.updateWorld(new THREE.Matrix4().identity());

    this.appendSquare(square);

    this.state = {
      ...this.state,
      current: square,
    };

    return this;
  }

  public rotate(radians: number): SquareMeshBuilder {
    if (this.state.current === null) {
      throw new Error("rotate() requires an existing square. Call with() first.");
    }

    const currentCenter = new THREE.Vector3(0, 0, 0).applyMatrix4(this.state.current.worldMatrix);

    const translation = new THREE.Matrix4().makeTranslation(
      currentCenter.x,
      currentCenter.y,
      currentCenter.z,
    );

    const rotation = new THREE.Matrix4().makeRotationZ(radians);
    const localMatrix = new THREE.Matrix4().multiplyMatrices(translation, rotation);

    const rotated = new Square(localMatrix);
    rotated.updateWorld(new THREE.Matrix4().identity());

    this.state = {
      ...this.state,
      current: rotated,
    };

    return this;
  }

  public push(): SquareMeshBuilder {
    this.stack.push({
      current: this.state.current,
      parentWorld: this.state.parentWorld.clone(),
    });

    return this;
  }

  public pop(): SquareMeshBuilder {
    const previous = this.stack.pop();
    if (!previous) {
      throw new Error("Cannot pop() from an empty builder stack.");
    }

    this.state = {
      current: previous.current,
      parentWorld: previous.parentWorld.clone(),
    };

    return this;
  }

  public build(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3),
    );

    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(this.normals, 3),
    );

    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(this.uvs, 2),
    );

    geometry.setIndex(this.indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  private appendSquare(square: ISquare): void {
    const baseVertex = this.positions.length / 3;

    const bottomLeft = new THREE.Vector3(-0.5, -0.5, 0).applyMatrix4(square.worldMatrix);
    const bottomRight = new THREE.Vector3(0.5, -0.5, 0).applyMatrix4(square.worldMatrix);
    const topRight = new THREE.Vector3(0.5, 0.5, 0).applyMatrix4(square.worldMatrix);
    const topLeft = new THREE.Vector3(-0.5, 0.5, 0).applyMatrix4(square.worldMatrix);

    this.pushVertex(bottomLeft);
    this.pushVertex(bottomRight);
    this.pushVertex(topRight);
    this.pushVertex(topLeft);

    this.normals.push(
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    );

    this.uvs.push(
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    );

    this.indices.push(
      baseVertex + 0, baseVertex + 1, baseVertex + 2,
      baseVertex + 0, baseVertex + 2, baseVertex + 3,
    );
  }

  private pushVertex(vertex: THREE.Vector3): void {
    this.positions.push(vertex.x, vertex.y, vertex.z);
  }

  private getOppositeSemantic(semantic: SquareSemantic): SquareSemantic {
    switch (semantic) {
      case "Left":
      case "Left.Mid":
        return "Right.Mid";
      case "Left.Top":
        return "Right.Top";
      case "Left.Bottom":
        return "Right.Bottom";

      case "Right":
      case "Right.Mid":
        return "Left.Mid";
      case "Right.Top":
        return "Left.Top";
      case "Right.Bottom":
        return "Left.Bottom";

      case "Top":
      case "Top.Mid":
        return "Bottom.Mid";
      case "Top.Left":
        return "Bottom.Left";
      case "Top.Right":
        return "Bottom.Right";

      case "Bottom":
      case "Bottom.Mid":
        return "Top.Mid";
      case "Bottom.Left":
        return "Top.Left";
      case "Bottom.Right":
        return "Top.Right";
    }
  }
}