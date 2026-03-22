// ============================================================================
// tests/fixtures/DragStateMachineFixture.ts
// OOP fixture
// ============================================================================

import { beforeEach } from "vitest";
import { DragStateMachine } from "../../src/index.js";
 
export class DragStateMachineFixture {
  private machineInstance!: DragStateMachine;

  public static create(): DragStateMachineFixture {
    const fixture = new DragStateMachineFixture();

    beforeEach(() => {
      fixture.machineInstance = fixture.createEnabledMachine();
    });

    return fixture;
  }

  public get machine(): DragStateMachine {
    return this.machineInstance;
  }

  public useEnabledMachine(): DragStateMachine {
    this.machineInstance = this.createEnabledMachine();
    return this.machineInstance;
  }

  public useDisabledMachine(): DragStateMachine {
    this.machineInstance = this.createDisabledMachine();
    return this.machineInstance;
  }

  public createEnabledMachine(): DragStateMachine {
    return new DragStateMachine(true);
  }

  public createDisabledMachine(): DragStateMachine {
    return new DragStateMachine(false);
  }

  public async pointerDown(
    pointerId: number = 1,
    x: number = 10,
    y: number = 20,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    return await this.machine.pointerDown(pointerId, x, y, targetId);
  }

  public async pointerMove(
    pointerId: number = 1,
    x: number = 15,
    y: number = 25,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    return await this.machine.pointerMove(pointerId, x, y, targetId);
  }

  public async pointerUp(
    pointerId: number = 1,
    x: number = 15,
    y: number = 25,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    return await this.machine.pointerUp(pointerId, x, y, targetId);
  }

  public async pointerCancel(
    pointerId: number = 1,
  ): Promise<DragStateMachine.Result> {
    return await this.machine.pointerCancel(pointerId);
  }

  public async reset(): Promise<DragStateMachine.Result> {
    return await this.machine.reset();
  }

  public async arm(
    pointerId: number = 1,
    x: number = 10,
    y: number = 20,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    return await this.pointerDown(pointerId, x, y, targetId);
  }

  public async startDragging(
    pointerId: number = 1,
    startX: number = 10,
    startY: number = 20,
    moveX: number = 15,
    moveY: number = 25,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    await this.pointerDown(pointerId, startX, startY, targetId);
    return await this.pointerMove(pointerId, moveX, moveY, targetId);
  }

  public async dropFromDragging(
    pointerId: number = 1,
    startX: number = 10,
    startY: number = 20,
    moveX: number = 15,
    moveY: number = 25,
    dropX: number = 20,
    dropY: number = 30,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    await this.pointerDown(pointerId, startX, startY, targetId);
    await this.pointerMove(pointerId, moveX, moveY, targetId);
    return await this.pointerUp(pointerId, dropX, dropY, targetId);
  }

  public async cancelFromDragging(
    pointerId: number = 1,
    startX: number = 10,
    startY: number = 20,
    moveX: number = 15,
    moveY: number = 25,
    targetId: string = "shape-1",
  ): Promise<DragStateMachine.Result> {
    await this.pointerDown(pointerId, startX, startY, targetId);
    await this.pointerMove(pointerId, moveX, moveY, targetId);
    return await this.pointerCancel(pointerId);
  }
}

// ============================================================================
// tests/FSM/DragStateMachine.spec.ts
// ============================================================================
