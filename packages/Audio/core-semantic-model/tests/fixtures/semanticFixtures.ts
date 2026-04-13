import { SemanticAddress } from "../../src/SemanticAddress.js";

export interface SemanticAddressFixture {
  readonly domain: string;
  readonly key: string;
  readonly address: SemanticAddress;
}

export function createSemanticAddressFixture(
  overrides: Partial<Pick<SemanticAddressFixture, "domain" | "key">> = {}
): SemanticAddressFixture {
  const domain = overrides.domain ?? "audio";
  const key = overrides.key ?? "shape:triangle";
  const address = new SemanticAddress(domain, key);

  return {
    domain,
    key,
    address,
  };
}

export function getSourceModuleSpecifiers(): readonly string[] {
  return [
    "../src/IEdgePointSubdivisionAlgorithm.js",
    "../src/IPoint2D.js",
    "../src/ISemanticAddress.js",
    "../src/ISemanticEdge.js",
    "../src/ISemanticEdgePoint.js",
    "../src/ISemanticProperty.js",
    "../src/ISemanticRelation.js",
    "../src/ISemanticShape.js",
    "../src/ISemanticShapeKind.js",
    "../src/ISemanticTopology.js",
    "../src/ISemanticVertex.js",
    "../src/SemanticAddress.js",
    "../src/SemanticValue.js",
    "../src/index.js",
  ] as const;
}