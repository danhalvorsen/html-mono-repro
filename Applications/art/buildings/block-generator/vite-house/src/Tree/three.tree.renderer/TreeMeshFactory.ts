import * as THREE from "three";
import type { ITreeTrunkDomainObject } from "../core.tree/core.tree";
import type { ITreeMeshFactory, IIndexedTreeGeometryBuilder } from "./three.tree.renderer";


export class TreeMeshFactory implements ITreeMeshFactory {
    private readonly geometryBuilder: IIndexedTreeGeometryBuilder;

    public constructor(geometryBuilder: IIndexedTreeGeometryBuilder) {
        this.geometryBuilder = geometryBuilder;
    }

    public create(
        domainObject: ITreeTrunkDomainObject,
        material?: THREE.Material
    ): THREE.Mesh {
        const geometry = this.geometryBuilder.build(domainObject);
        const resolvedMaterial = material ??
            new THREE.MeshStandardMaterial({
                roughness: 0.92,
                metalness: 0.02,
            });

        const mesh = new THREE.Mesh(geometry, resolvedMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }
}
