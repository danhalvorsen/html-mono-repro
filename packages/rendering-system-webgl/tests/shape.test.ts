
import { Matrix, Vector3 } from '@my-graphics/math';
import { Shape } from '../src/shape.js'
import { describe, expect, it } from "vitest";

describe('Shape constructor', () => {
    it('should initialize with given id, position, width, height, and default rotation', () => {
      const position = new Vector3(1, 2, 3);
      const width = 42;
      const height = 24;
      const shape = new Shape('shape-xyz', position, width, height);
  
      expect(shape.id).toBe('shape-xyz');
  
      const loc = shape.getLocation();
      expect(loc.x).toBe(1);
      expect(loc.y).toBe(2);
      expect(loc.z).toBe(3);
  
      expect(shape.getWidth()).toBe(width);
      expect(shape.getHeight()).toBe(height);
  
      const rotation = shape.getRotation();
      expect(rotation.equals(Matrix.identity(4))).toBe(true);
    });
  
    it('should accept custom rotation matrix in constructor', () => {
        const position = new Vector3(0, 0, 0);
        const rotation = Matrix.rotation(Math.PI / 4); // assuming it rotates around Z
        const shape = new Shape('rotated', position, 10, 10, rotation);
      
        expect(shape.getRotation().equals(rotation)).toBe(true);
      })
  });
  
