import * as THREE from "three";
import { MaterialToken } from "../../../../../../core-threejs-app-framework/src/Materials/MaterialToken.js";
import { Box } from "../../../../Builders/Box/box.js";
import { PrimitiveNodeFactory } from "../../../../PrimitiveNodeFactory.js";
import { PlaygroundSceneBase } from "../../../common/PlaygroundSceneBase.js";
export class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
    _primitiveNodeFactory;
    constructor(scene, materialFactory) {
        super(scene, "tiny-root", materialFactory);
    }
    get primitiveNodeFactory() {
        if (this._primitiveNodeFactory === undefined) {
            this._primitiveNodeFactory = new PrimitiveNodeFactory();
        }
        return this._primitiveNodeFactory;
    }
    createContent() {
        const sceneRoot = this.createSceneGraph();
        const object3D = sceneRoot.instantiate();
        this.applyMaterial(object3D);
        this.addToRoot(object3D);
        this.addToRoot(new THREE.AxesHelper(5));
    }
    createSceneGraph() {
        const houseTemplate = this.createHouseTemplate();
        const root = this.primitiveNodeFactory.createGroup("Scene.Root");
        root.add(houseTemplate.cloneNode());
        return root;
    }
    createHouseTemplate() {
        const house = this.primitiveNodeFactory.createGroup("Template.House");
        const body = this.primitiveNodeFactory.box("House.Body", new Box(2, 1, 2));
        const roof = this.primitiveNodeFactory.box("House.Roof", new Box(2.2, 0.4, 2.2));
        house.add(this.primitiveNodeFactory.createTransform("House.Body.Instance", body, {
            position: new THREE.Vector3(0, 0.5, 0),
        }));
        house.add(this.primitiveNodeFactory.createTransform("House.Roof.Instance", roof, {
            position: new THREE.Vector3(0, 1.3, 0),
            rotation: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(15)),
        }));
        return house;
    }
    applyMaterial(root) {
        root.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) {
                return;
            }
            node.material = this.materialFactory.create(MaterialToken.BuildingBlue);
            node.castShadow = true;
            node.receiveShadow = true;
        });
    }
}
//# sourceMappingURL=TinyPrimitiveCompositionScene.js.map