// packages/core-json/tests/Json.test.ts

import { describe, expect, it } from 'vitest';
import { Json } from '../src/code.js';
 
class JsonTestFixture {
  public createPrimitiveValue(): Json.Value {
    return 'hello';
  }

  public createObjectValue(): Json.Value {
    return {
      name: 'drawing-tool',
      version: 1,
      enabled: true,
      nested: {
        items: [1, 'two', false, null],
      },
    };
  }

  public createArrayValue(): Json.Value {
    return [1, 'two', false, null, { x: 10, y: 20 }];
  }

  public createCircularObject(): Record<string, unknown> {
    const value: Record<string, unknown> = {
      name: 'circular',
    };

    value['self'] = value;
    return value;
  }

  public createMalformedJson(): string {
    return '{"name":';
  }

  public createSerializedObject(): string {
    return '{"name":"drawing-tool","version":1,"enabled":true}';
  }
}

describe('Json', () => {
  const fixture = new JsonTestFixture();

  describe('serialize', () => {
    it('should serialize a primitive value', () => {
      const value = fixture.createPrimitiveValue();

      const result = Json.serialize(value);

      expect(result).toBe('"hello"');
    });

    it('should serialize an object value', () => {
      const value = fixture.createObjectValue();

      const result = Json.serialize(value);

      expect(result).toBe(
        '{"name":"drawing-tool","version":1,"enabled":true,"nested":{"items":[1,"two",false,null]}}',
      );
    });

    it('should serialize an array value', () => {
      const value = fixture.createArrayValue();

      const result = Json.serialize(value);

      expect(result).toBe('[1,"two",false,null,{"x":10,"y":20}]');
    });

    it('should throw the standard error when serialization fails', () => {
      const value = fixture.createCircularObject() as Json.Value;

      expect(() => Json.serialize(value)).toThrowError(Json.Errors.SerializeFailed);
    });
  });

  describe('deserialize', () => {
    it('should deserialize to a typed object', () => {
      type Payload = {
        readonly name: string;
        readonly version: number;
        readonly enabled: boolean;
      };

      const json = fixture.createSerializedObject();

      const result = Json.deserialize<Payload>(json);

      expect(result).toEqual({
        name: 'drawing-tool',
        version: 1,
        enabled: true,
      });
    });

    it('should deserialize to a primitive value', () => {
      const result = Json.deserialize<number>('42');

      expect(result).toBe(42);
    });

    it('should deserialize to an array value', () => {
      const result = Json.deserialize<Json.Array>('[1,"two",false,null]');

      expect(result).toEqual([1, 'two', false, null]);
    });

    it('should throw the standard error when deserialization fails', () => {
      const json = fixture.createMalformedJson();

      expect(() => Json.deserialize(json)).toThrowError(Json.Errors.DeserializeFailed);
    });
  });
});
