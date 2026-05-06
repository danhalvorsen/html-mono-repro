import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { BrowserKeyboardEventName, BrowserWindowEventName } from './BrowserInputEventName.js';
import type { BrowserKeyboardCode } from './BrowserKeyboardCode.js';
import {
  DefaultBrowserKeyboardCodeParser,
  type BrowserKeyboardCodeParser
} from './BrowserKeyboardCodeParser.js';
import { DefaultPlayerKeyMap } from './DefaultPlayerKeyMap.js';
import { PlayerInputAxis } from './PlayerInputAxis.js';
import type { PlayerKeyMap } from './PlayerKeyMap.js';

export class PlayerInputController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #eventSource: EventTarget;
  readonly #keyMap: PlayerKeyMap;
  readonly #codeParser: BrowserKeyboardCodeParser;
  readonly #pressedCodes = new Set<BrowserKeyboardCode>();

  public constructor(
    host: ReactiveControllerHost,
    keyMap: PlayerKeyMap = new DefaultPlayerKeyMap(),
    codeParser: BrowserKeyboardCodeParser = new DefaultBrowserKeyboardCodeParser(),
    eventSource: EventTarget = globalThis
  ) {
    this.#host = host;
    this.#keyMap = keyMap;
    this.#codeParser = codeParser;
    this.#eventSource = eventSource;
    this.#host.addController(this);
  }

  public get horizontalAxis(): number {
    return new PlayerInputAxis({
      negative: this.#pressedCodes.has(this.#keyMap.moveLeft),
      positive: this.#pressedCodes.has(this.#keyMap.moveRight)
    }).value;
  }

  public get verticalAxis(): number {
    return new PlayerInputAxis({
      negative: this.#pressedCodes.has(this.#keyMap.moveUp),
      positive: this.#pressedCodes.has(this.#keyMap.moveDown)
    }).value;
  }

  public get isFirePressed(): boolean {
    return this.#pressedCodes.has(this.#keyMap.fire);
  }

  public hostConnected(): void {
    this.#eventSource.addEventListener(BrowserKeyboardEventName.KeyDown, this.#onKeyDown);
    this.#eventSource.addEventListener(BrowserKeyboardEventName.KeyUp, this.#onKeyUp);
    this.#eventSource.addEventListener(BrowserWindowEventName.Blur, this.#onBlur);
  }

  public hostDisconnected(): void {
    this.#eventSource.removeEventListener(BrowserKeyboardEventName.KeyDown, this.#onKeyDown);
    this.#eventSource.removeEventListener(BrowserKeyboardEventName.KeyUp, this.#onKeyUp);
    this.#eventSource.removeEventListener(BrowserWindowEventName.Blur, this.#onBlur);
    this.#pressedCodes.clear();
  }

  readonly #onKeyDown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) return;

    this.#setPressed(event.code, true);
  };

  readonly #onKeyUp = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) return;

    this.#setPressed(event.code, false);
  };

  readonly #onBlur = (): void => {
    if (this.#pressedCodes.size === 0) return;

    this.#pressedCodes.clear();
    this.#host.requestUpdate();
  };

  #setPressed(rawCode: string, pressed: boolean): void {
    const code = this.#codeParser.parse(rawCode);

    if (code === null) return;
    if (!this.#isMapped(code)) return;

    const changed = pressed
      ? this.#addPressedCode(code)
      : this.#pressedCodes.delete(code);

    if (!changed) return;

    this.#host.requestUpdate();
  }

  #addPressedCode(code: BrowserKeyboardCode): boolean {
    const size = this.#pressedCodes.size;
    this.#pressedCodes.add(code);
    return this.#pressedCodes.size !== size;
  }

  #isMapped(code: BrowserKeyboardCode): boolean {
    return (
      code === this.#keyMap.moveUp ||
      code === this.#keyMap.moveDown ||
      code === this.#keyMap.moveLeft ||
      code === this.#keyMap.moveRight ||
      code === this.#keyMap.fire
    );
  }
}
