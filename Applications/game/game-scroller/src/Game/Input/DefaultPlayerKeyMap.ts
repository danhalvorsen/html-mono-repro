import type { BrowserKeyboardCode } from './BrowserKeyboardCode';
import type { PlayerKeyMap } from './PlayerKeyMap';


export class DefaultPlayerKeyMap implements PlayerKeyMap {
  public readonly moveUp = BrowserKeyboardCode.arrowUp;
  public readonly moveDown = BrowserKeyboardCode.arrowDown;
  public readonly moveLeft = BrowserKeyboardCode.arrowLeft;
  public readonly moveRight = BrowserKeyboardCode.arrowRight;
  public readonly fire = BrowserKeyboardCode.space;

  public isMapped(code: BrowserKeyboardCode): boolean {
    return (
      code === this.moveUp ||
      code === this.moveDown ||
      code === this.moveLeft ||
      code === this.moveRight ||
      code === this.fire
    );
  }
}
