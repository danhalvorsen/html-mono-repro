import { Vector2Gpu } from "@monorepo/core-math-gpu";
import type { IBox2, IBoxModule } from "@monorepo/core-math-rectangle";
import { CenteredWindowsScenarioStrategy } from "./CenteredWindowsScenarioStrategy.js";
import { GridWindowsScenarioStrategy } from "./GridWindowsScenarioStrategy.js";
import { LinearWindowsScenarioStrategy } from "./LinearWindowsScenarioStrategy.js";
import { SIDE_WALL_INWARD_ROTATION_RADIANS, WALL_HEIGHT, WALL_WIDTH, type IPlacementSceneInitializationStrategy, type IWallConnectionPoint, type IWallPlacementInitialization, type IWallPlacementScenarioStrategy } from "../Placement.Platground.Scene.js";

export class PlacementPlaygroundInitializationStrategy
  implements IPlacementSceneInitializationStrategy {
  public constructor(
    private readonly boxModule: IBoxModule,
  ) { }

  public initialize(): readonly IWallPlacementInitialization[] {
    const hostBounds = this.boxModule.createAabb2(
      new Vector2Gpu(-WALL_WIDTH * 0.5, 0),
      new Vector2Gpu(WALL_WIDTH * 0.5, WALL_HEIGHT),
    );
    const leftWall = this.createSideWallInitialization(
      -4,
      0,
      WALL_WIDTH * 0.5,
      -SIDE_WALL_INWARD_ROTATION_RADIANS,
      new LinearWindowsScenarioStrategy(this.boxModule),
      hostBounds
    );
    const rightWall = this.createSideWallInitialization(
      4,
      0,
      -(WALL_WIDTH * 0.5),
      SIDE_WALL_INWARD_ROTATION_RADIANS,
      new GridWindowsScenarioStrategy(this.boxModule),
      hostBounds
    );
    const centerWall = this.createCenterWallInitialization(
      leftWall,
      rightWall,
      new CenteredWindowsScenarioStrategy(this.boxModule),
      hostBounds
    );

    return [leftWall, centerWall, rightWall];
  }

  private createSideWallInitialization(
    connectionX: number,
    connectionZ: number,
    localConnectionX: number,
    rotationYRadians: number,
    scenarioStrategy: IWallPlacementScenarioStrategy,
    hostBounds: IBox2
  ): IWallPlacementInitialization {
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

  private createCenterWallInitialization(
    leftWall: IWallPlacementInitialization,
    rightWall: IWallPlacementInitialization,
    scenarioStrategy: IWallPlacementScenarioStrategy,
    hostBounds: IBox2
  ): IWallPlacementInitialization {
    const leftConnection = this.createConnectionPoint(
      leftWall.positionX,
      leftWall.positionZ,
      leftWall.rotationYRadians,
      WALL_WIDTH * 0.5
    );
    const rightConnection = this.createConnectionPoint(
      rightWall.positionX,
      rightWall.positionZ,
      rightWall.rotationYRadians,
      -(WALL_WIDTH * 0.5)
    );

    return {
      positionX: (leftConnection.x + rightConnection.x) * 0.5,
      positionZ: (leftConnection.z + rightConnection.z) * 0.5,
      rotationYRadians: 0,
      hostBounds,
      scenario: scenarioStrategy.createScenario(),
    };
  }

  private createConnectionPoint(
    wallPositionX: number,
    wallPositionZ: number,
    rotationYRadians: number,
    localConnectionX: number
  ): IWallConnectionPoint {
    return {
      x: wallPositionX + (Math.cos(rotationYRadians) * localConnectionX),
      z: wallPositionZ - (Math.sin(rotationYRadians) * localConnectionX),
    };
  }
}
