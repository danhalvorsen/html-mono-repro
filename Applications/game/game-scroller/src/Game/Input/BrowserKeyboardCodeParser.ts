import {
  BrowserKeyboardCode,
  type BrowserKeyboardCode as BrowserKeyboardCodeValue
} from './BrowserKeyboardCode.js';

export interface BrowserKeyboardCodeParser {
  parse(code: string): BrowserKeyboardCodeValue | null;
}

export class DefaultBrowserKeyboardCodeParser implements BrowserKeyboardCodeParser {
  public parse(code: string): BrowserKeyboardCodeValue | null {
    if (code === BrowserKeyboardCode.KeyW) return BrowserKeyboardCode.KeyW;
    if (code === BrowserKeyboardCode.KeyA) return BrowserKeyboardCode.KeyA;
    if (code === BrowserKeyboardCode.KeyD) return BrowserKeyboardCode.KeyD;
    if (code === BrowserKeyboardCode.KeyX) return BrowserKeyboardCode.KeyX;
    if (code === BrowserKeyboardCode.ArrowUp) return BrowserKeyboardCode.ArrowUp;
    if (code === BrowserKeyboardCode.ArrowDown) return BrowserKeyboardCode.ArrowDown;
    if (code === BrowserKeyboardCode.ArrowLeft) return BrowserKeyboardCode.ArrowLeft;
    if (code === BrowserKeyboardCode.ArrowRight) return BrowserKeyboardCode.ArrowRight;
    if (code === BrowserKeyboardCode.Space) return BrowserKeyboardCode.Space;

    return null;
  }
}
