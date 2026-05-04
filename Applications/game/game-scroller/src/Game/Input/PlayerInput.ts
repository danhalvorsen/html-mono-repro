import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { BrowserKeyboardEventName, BrowserWindowEventName } from './playerControl';
import { toBrowserKeyboardCode } from './toBrowserKeyboardCode';
import { PlayerInputAxis } from './PlayerInputAxis';
import { BrowserKeyboardCode } from './BrowserKeyboardCode';
import { DefaultPlayerKeyMap } from './DefaultPlayerKeyMap';
import { PlayerKeyMap } from './PlayerKeyMap';


export class PlayerInput implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #keyMap: PlayerKeyMap;
  readonly #pressedCodes = new Set<BrowserKeyboardCode>();

  public constructor(
    host: ReactiveControllerHost,
    keyMap: PlayerKeyMap = new DefaultPlayerKeyMap()
  ) {
    this.#host = host;
    this.#keyMap = keyMap;
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
    globalThis.addEventListener(BrowserKeyboardEventName.keyDown, this.#onKeyDown);
    globalThis.addEventListener(BrowserKeyboardEventName.keyUp, this.#onKeyUp);
    globalThis.addEventListener(BrowserWindowEventName.blur, this.#onBlur);
  }

  public hostDisconnected(): void {
    globalThis.removeEventListener(BrowserKeyboardEventName.keyDown, this.#onKeyDown);
    globalThis.removeEventListener(BrowserKeyboardEventName.keyUp, this.#onKeyUp);
    globalThis.removeEventListener(BrowserWindowEventName.blur, this.#onBlur);
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
    const code = toBrowserKeyboardCode(rawCode);

    if (code === null) return;
    if (!this.#keyMap.isMapped(code)) return;

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
}
