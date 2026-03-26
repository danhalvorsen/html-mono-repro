// ============================================================================
// FILE: Applications/art/buildings/block-generator/vite-house/tests/Builders/builder1/SquareTransform.spec.ts
// ============================================================================

import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { SquareTransformFixture } from "./fixtures/SquareTransform.fixture.js";

describe("Square transform", () => {
  const fx = new SquareTransformFixture();

  it("should define a square with localMatrix", () => {
    const localMatrix = fx.createLocalMatrix();
    expect(localMatrix).toBeInstanceOf(THREE.Matrix4);
  });

  it("should define a square with worldMatrix", () => {
    const localMatrix = fx.createLocalMatrix();
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);

    expect(worldMatrix).toBeInstanceOf(THREE.Matrix4);
  });

  it("should keep worldMatrix equal to localMatrix when parent is identity", () => {
    const localMatrix = fx.createLocalMatrix(10, 20, 0);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);

    expect(worldMatrix.elements).toStrictEqual(localMatrix.elements);
  });

  it("should compose worldMatrix from parentWorld * localMatrix", () => {
    const parentWorld = fx.createLocalMatrix(10, 0, 0);
    const localMatrix = fx.createLocalMatrix(5, 0, 0);
    const worldMatrix = fx.createWorldMatrix(parentWorld, localMatrix);
    const point = fx.transformPoint(worldMatrix, 0, 0);

    fx.expectPoint(point, 15, 0, 0);
  });

  it("should transform local origin to world position", () => {
    const localMatrix = fx.createLocalMatrix(10, 10, 0);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const origin = fx.transformPoint(worldMatrix, 0, 0);

    fx.expectPoint(origin, 10, 10, 0);
  });

  it("should rotate local right vector into world top at 90 degrees", () => {
    const localMatrix = fx.createLocalMatrix(0, 0, Math.PI / 2);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const point = fx.transformPoint(worldMatrix, 1, 0);

    fx.expectPoint(point, 0, 1, 0);
  });

  it("should rotate local top vector into world left at 90 degrees", () => {
    const localMatrix = fx.createLocalMatrix(0, 0, Math.PI / 2);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const point = fx.transformPoint(worldMatrix, 0, 1);

    fx.expectPoint(point, -1, 0, 0);
  });

  it("should place Right.Mid anchor in world space using worldMatrix", () => {
    const localMatrix = fx.createLocalMatrix(10, 20, 0);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const rightMid = fx.transformPoint(worldMatrix, 0.5, 0);

    fx.expectPoint(rightMid, 10.5, 20, 0);
  });

  it("should place Top.Left anchor in world space using worldMatrix", () => {
    const localMatrix = fx.createLocalMatrix(10, 20, 0);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const topLeft = fx.transformPoint(worldMatrix, -0.5, 0.5);

    fx.expectPoint(topLeft, 9.5, 20.5, 0);
  });

  it("should rotate Right.Mid anchor with the square", () => {
    const localMatrix = fx.createLocalMatrix(0, 0, Math.PI / 2);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const rightMid = fx.transformPoint(worldMatrix, 0.5, 0);

    fx.expectPoint(rightMid, 0, 0.5, 0);
  });

  it("should rotate Bottom.Right anchor with the square", () => {
    const localMatrix = fx.createLocalMatrix(0, 0, Math.PI / 2);
    const worldMatrix = fx.createWorldMatrix(new THREE.Matrix4().identity(), localMatrix);
    const bottomRight = fx.transformPoint(worldMatrix, 0.5, -0.5);

    fx.expectPoint(bottomRight, 0.5, 0.5, 0);
  });

  it("should support hierarchical parent-child composition", () => {
    const parentWorld = fx.createLocalMatrix(10, 10, Math.PI / 2);
    const childLocal = fx.createLocalMatrix(1, 0, 0);
    const childWorld = fx.createWorldMatrix(parentWorld, childLocal);
    const childOrigin = fx.transformPoint(childWorld, 0, 0);

    fx.expectPoint(childOrigin, 10, 11, 0);
  });
});