export const BrowserKeyboardCode = {
  KeyW: 'KeyW',
  KeyA: 'KeyA',
  KeyD: 'KeyD',
  KeyX: 'KeyX',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Space: 'Space'
} as const;

export type BrowserKeyboardCode =
  typeof BrowserKeyboardCode[keyof typeof BrowserKeyboardCode];
