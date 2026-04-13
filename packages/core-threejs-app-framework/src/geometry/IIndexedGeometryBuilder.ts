import * as THREE from "three";


export interface IIndexedGeometryBuilder<TBuilder> {
    with(point0: THREE.Vector2, point1: THREE.Vector2): TBuilder;
    withLoft(height: number): TBuilder;
    build(): THREE.BufferGeometry;
}
