import { Window, WindowBuilder } from "../../../../Builders/IWindowBuilder.js";
import { MaterialToken } from "../../../../../../core-threejs-app-framework/src/Materials/MaterialToken.js";
import { REGION_GUIDE_COLOR, REJECTED_GUIDE_COLOR, WINDOW_Z_OFFSET, WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH } from "../Placement.Platground.Scene.js";
import { WindowRegionPlacementValidator } from "../spesifications/WindowRegionPlacementValidator.js";
import * as THREE from "three";
export class PlacementPlaygroundDrawingStrategy {
    materialFactory;
    boxModule;
    constructor(materialFactory, boxModule) {
        this.materialFactory = materialFactory;
        this.boxModule = boxModule;
    }
    draw(initialization) {
        const group = new THREE.Group();
        const { positionX, positionZ, rotationYRadians, hostBounds, scenario } = initialization;
        group.position.set(positionX, 0, positionZ);
        group.rotation.y = rotationYRadians;
        group.add(this.createWallMesh());
        for (const region of scenario.regions) {
            group.add(this.createBoundsGuide(region.bounds, REGION_GUIDE_COLOR, 0.2));
        }
        this.drawValidatedWindows(group, scenario.candidates, hostBounds, scenario.regions);
        return group;
    }
    drawValidatedWindows(root, candidates, hostBounds, regions) {
        const validator = new WindowRegionPlacementValidator(hostBounds, regions, 0.15, this.boxModule);
        const occupied = [];
        for (const regionalCandidate of candidates) {
            const result = validator.validate(regionalCandidate, occupied);
            if (!result.isValid || result.acceptedPlan === null) {
                root.add(this.createBoundsGuide(regionalCandidate.candidate.bounds, REJECTED_GUIDE_COLOR, 0.22));
                continue;
            }
            const acceptedCandidate = result.acceptedPlan.reservation.candidate;
            const center = acceptedCandidate.bounds.center();
            const window = this.createWindow(acceptedCandidate.bounds.width(), acceptedCandidate.bounds.height());
            window.position.set(center.x, center.y, WINDOW_Z_OFFSET);
            root.add(window);
            occupied.push({ candidate: acceptedCandidate });
        }
    }
    createWallMesh() {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH), this.materialFactory.create(MaterialToken.BuildingWhite));
        wall.position.set(0, WALL_HEIGHT * 0.5, 0);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }
    createWindow(width, height) {
        return new WindowBuilder(this.materialFactory).build(new Window({ rect: { x: 0, y: 0, width, height }, material: MaterialToken.BuildingBlue }, { material: MaterialToken.WindowGlassDark, inset: 0.08 }));
    }
    createBoundsGuide(bounds, color, zOffset) {
        const center = bounds.center();
        const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(bounds.width(), bounds.height(), 0.02));
        const material = new THREE.LineBasicMaterial({ color });
        const guide = new THREE.LineSegments(geometry, material);
        guide.position.set(center.x, center.y, zOffset);
        return guide;
    }
}
//# sourceMappingURL=PlacementPlaygroundDrawingStrategy.js.map