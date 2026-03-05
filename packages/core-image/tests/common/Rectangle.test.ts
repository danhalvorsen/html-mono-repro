// packages/core-image/tests/Rectangle.test.ts

import { describe, it, expect } from "vitest"
import { RectangleFixture } from '../fixtures/RectangleFixture.js'

describe("Rectangle", () => {

  it("computes boundaries correctly", () => {

    const fx = new RectangleFixture()
    const r = fx.create(10, 20, 30, 40)

    expect(r.left).toBe(10)
    expect(r.top).toBe(20)
    expect(r.right).toBe(40)
    expect(r.bottom).toBe(60)

  })

  it("contains point inside rectangle", () => {

    const fx = new RectangleFixture()
    const r = fx.create()

    expect(r.contains(20, 30)).toBe(true)

  })

  it("does not contain point outside rectangle", () => {

    const fx = new RectangleFixture()
    const r = fx.create()

    expect(r.contains(0, 0)).toBe(false)

  })

  it("intersects overlapping rectangles", () => {

    const fx = new RectangleFixture()
    const { a, b } = fx.overlapping()

    expect(a.intersects(b)).toBe(true)
    expect(b.intersects(a)).toBe(true)

  })

  it("does not intersect disjoint rectangles", () => {

    const fx = new RectangleFixture()
    const { a, b } = fx.disjoint()

    expect(a.intersects(b)).toBe(false)
    expect(b.intersects(a)).toBe(false)

  })

  it("computes intersection rectangle", () => {

    const fx = new RectangleFixture()
    const { a, b } = fx.overlapping()

    const r = a.intersection(b)

    expect(r).not.toBeNull()

    expect(r!.left).toBe(20)
    expect(r!.top).toBe(20)
    expect(r!.right).toBe(40)
    expect(r!.bottom).toBe(40)

  })

  it("returns null for intersection when rectangles are disjoint", () => {

    const fx = new RectangleFixture()
    const { a, b } = fx.disjoint()

    const r = a.intersection(b)

    expect(r).toBeNull()

  })

})