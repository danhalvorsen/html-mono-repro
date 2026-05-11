import type { BrowserKeyboardCode } from './BrowserKeyboardCode.js';

export interface PlayerKeyMap {
  readonly moveUp: BrowserKeyboardCode;
  readonly moveDown: BrowserKeyboardCode;
  readonly moveLeft: BrowserKeyboardCode;
  readonly moveRight: BrowserKeyboardCode;
  readonly fire: BrowserKeyboardCode;

  isMapped(code: BrowserKeyboardCode): boolean;
}
