import { BrowserKeyboardCode } from './BrowserKeyboardCode.js';
import type { BrowserKeyboardCode as BrowserKeyboardCodeValue } from './BrowserKeyboardCode.js';
import type { PlayerKeyMap } from './PlayerKeyMap.js';

export class WasdXPlayerKeyMap implements PlayerKeyMap {
  public readonly moveUp = BrowserKeyboardCode.KeyW;
  public readonly moveDown = BrowserKeyboardCode.KeyX;
  public readonly moveLeft = BrowserKeyboardCode.KeyA;
  public readonly moveRight = BrowserKeyboardCode.KeyD;
  public readonly fire = BrowserKeyboardCode.Space;

  public isMapped(code: BrowserKeyboardCodeValue): boolean {
    return (
      code === this.moveUp ||
      code === this.moveDown ||
      code === this.moveLeft ||
      code === this.moveRight ||
      code === this.fire
    );
  }
}
