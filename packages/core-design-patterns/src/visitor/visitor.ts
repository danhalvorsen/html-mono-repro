interface Drawable {
  accept(visitor: ShapeVisitor): void
}

interface ShapeVisitor {
  visitCircle(shape: Circle): void
  visitSquare(shape: Square): void
  visitTriangle(shape: Triangle): void
}

class Drawer implements ShapeVisitor {
  visitCircle(shape: Circle) {}

  visitSquare(shape: Square) {}

  visitTriangle(shape: Triangle) {}

  draw(shape: Drawable) {
    shape.accept(this)
  }
}

class Square implements Drawable {
  accept(visitor: ShapeVisitor) {
    visitor.visitSquare(this)
  }
}

class Circle implements Drawable {
  accept(visitor: ShapeVisitor) {
    visitor.visitCircle(this)
  }
}

class Triangle implements Drawable {
  accept(visitor: ShapeVisitor) {
    visitor.visitTriangle(this)
  }
}