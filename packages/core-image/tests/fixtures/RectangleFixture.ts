// packages/core-image/tests/fixtures/RectangleFixture.ts

import { Rectangle } from "../../src/common/implementation/Rectangle.js"

export class RectangleFixture {

  create(x = 10, y = 20, w = 30, h = 40): Rectangle {
    return new Rectangle(x, y, w, h)
  }

  overlapping(): { a: Rectangle, b: Rectangle } {

    const a = new Rectangle(10, 10, 30, 30)
    const b = new Rectangle(20, 20, 30, 30)

    return { a, b }
  }

  disjoint(): { a: Rectangle, b: Rectangle } {

    const a = new Rectangle(10, 10, 20, 20)
    const b = new Rectangle(100, 100, 20, 20)

    return { a, b }
  }
}