import {
  BrowserKeyboardCode,
  type BrowserKeyboardCode as BrowserKeyboardCodeValue
} from './BrowserKeyboardCode.js';
import type { PlayerKeyMap } from './PlayerKeyMap.js';

export class DefaultPlayerKeyMap implements PlayerKeyMap {
  public readonly moveUp = BrowserKeyboardCode.ArrowUp;
  public readonly moveDown = BrowserKeyboardCode.ArrowDown;
  public readonly moveLeft = BrowserKeyboardCode.ArrowLeft;
  public readonly moveRight = BrowserKeyboardCode.ArrowRight;
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