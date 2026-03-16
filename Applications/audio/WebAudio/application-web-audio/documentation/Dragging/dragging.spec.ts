 
import { describe, it, expect } from "vitest";

const machine = describe;
const scenario = describe;
const then = it;
const should = expect;

machine("DragController on Drag", () => {
  scenario("object should be constrained within the canvas boundaries", () => {
    then("object crosses the canvas boundaries", () => {
      should(object.direction).toBe(object.direction * -1);
    });
  });
});

machine("DragController on OnDrag", () => {
  scenario("object should not be constrained in xy space because there are no constraints", () => {
    then("object crosses the canvas boundaries", () => {
      should(object.direction).toBe(object.direction * -1);
    });
  });
});

describe('DragController', () => { 
    it('OnDrag', () => {
        should('activate the last matching draggable on mouse down', () => {                    });
    })

    it('OnDragOver', () => {
        
    })
}):

describe('Vertex boundaries', () => { 
    it('should limited a vertex in xy plane', () => {

    })
}):