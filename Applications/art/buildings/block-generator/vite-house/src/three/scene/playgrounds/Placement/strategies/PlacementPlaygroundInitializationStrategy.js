import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { CenteredWindowsScenarioStrategy } from "./CenteredWindowsScenarioStrategy.js";
import { GridWindowsScenarioStrategy } from "./GridWindowsScenarioStrategy.js";
import { LinearWindowsScenarioStrategy } from "./LinearWindowsScenarioStrategy.js";
import { SIDE_WALL_INWARD_ROTATION_RADIANS, WALL_HEIGHT, WALL_WIDTH } from "../Placement.Platground.Scene.js";
export class PlacementPlaygroundInitializationStrategy {
    boxModule;
    constructor(boxModule) {
        this.boxModule = boxModule;
    }
    initialize() {
        const hostBounds = this.boxModule.createAabb2(new Vector2Gpu(-WALL_WIDTH * 0.5, 0), new Vector2Gpu(WALL_WIDTH * 0.5, WALL_HEIGHT));
        const leftWall = this.createSideWallInitialization(-4, 0, WALL_WIDTH * 0.5, -SIDE_WALL_INWARD_ROTATION_RADIANS, new LinearWindowsScenarioStrategy(this.boxModule), hostBounds);
        const rightWall = this.createSideWallInitialization(4, 0, -(WALL_WIDTH * 0.5), SIDE_WALL_INWARD_ROTATION_RADIANS, new GridWindowsScenarioStrategy(this.boxModule), hostBounds);
        const centerWall = this.createCenterWallInitialization(leftWall, rightWall, new CenteredWindowsScenarioStrategy(this.boxModule), hostBounds);
        return [leftWall, centerWall, rightWall];
    }
    createSideWallInitialization(connectionX, connectionZ, localConnectionX, rotationYRadians, scenarioStrategy, hostBounds) {
        const positionX = connectionX - (Math.cos(rotationYRadians) * localConnectionX);
        const positionZ = connectionZ + (Math.sin(rotationYRadians) * localConnectionX);
        return {
            positionX,
            positionZ,
            rotationYRadians,
            hostBounds,
            scenario: scenarioStrategy.createScenario(),
        };
    }
    createCenterWallInitialization(leftWall, rightWall, scenarioStrategy, hostBounds) {
        const leftConnection = this.createConnectionPoint(leftWall.positionX, leftWall.positionZ, leftWall.rotationYRadians, WALL_WIDTH * 0.5);
        const rightConnection = this.createConnectionPoint(rightWall.positionX, rightWall.positionZ, rightWall.rotationYRadians, -(WALL_WIDTH * 0.5));
        return {
            positionX: (leftConnection.x + rightConnection.x) * 0.5,
            positionZ: (leftConnection.z + rightConnection.z) * 0.5,
            rotationYRadians: 0,
            hostBounds,
            scenario: scenarioStrategy.createScenario(),
        };
    }
    createConnectionPoint(wallPositionX, wallPositionZ, rotationYRadians, localConnectionX) {
        return {
            x: wallPositionX + (Math.cos(rotationYRadians) * localConnectionX),
            z: wallPositionZ - (Math.sin(rotationYRadians) * localConnectionX),
        };
    }
}
//# sourceMappingURL=PlacementPlaygroundInitializationStrategy.js.map