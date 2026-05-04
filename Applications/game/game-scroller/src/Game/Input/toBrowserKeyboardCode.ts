import { BrowserKeyboardCode } from './BrowserKeyboardCode.1';


export function toBrowserKeyboardCode(code: string): BrowserKeyboardCode | null {
  switch (code) {
    case BrowserKeyboardCode.arrowUp:
      return BrowserKeyboardCode.arrowUp;

    case BrowserKeyboardCode.arrowDown:
      return BrowserKeyboardCode.arrowDown;

    case BrowserKeyboardCode.arrowLeft:
      return BrowserKeyboardCode.arrowLeft;

    case BrowserKeyboardCode.arrowRight:
      return BrowserKeyboardCode.arrowRight;

    case BrowserKeyboardCode.space:
      return BrowserKeyboardCode.space;

    default:
      return null;
  }
}
