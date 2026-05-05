# FILE: fix-player-input.ps1
# RUN FROM: Applications\game\game-scroller

[CmdletBinding()]
param(
  [switch] $SkipBuild,
  [switch] $SkipTests
)

$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path '.').Path
$InputRoot = Join-Path $Root 'src\Game\Input'

if (-not (Test-Path $InputRoot)) {
  throw "Expected path not found: $InputRoot"
}

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Write-CodeFile {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,

    [Parameter(Mandatory = $true)]
    [string] $Content
  )

  $Directory = Split-Path -Parent $Path

  if (-not (Test-Path $Directory)) {
    New-Item -ItemType Directory -Path $Directory -Force | Out-Null
  }

  if (Test-Path $Path) {
    Copy-Item -Path $Path -Destination "$Path.bak-$Stamp" -Force
  }

  [System.IO.File]::WriteAllText($Path, $Content.TrimStart(), $Utf8NoBom)
}

function Remove-StaleFile {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path
  )

  if (-not (Test-Path $Path)) {
    return
  }

  Copy-Item -Path $Path -Destination "$Path.bak-$Stamp" -Force
  Remove-Item -Path $Path -Force
}

Write-CodeFile `
  -Path (Join-Path $InputRoot 'BrowserKeyboardCode.ts') `
  -Content @'
export const BrowserKeyboardCode = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Space: 'Space'
} as const;

export type BrowserKeyboardCode =
  typeof BrowserKeyboardCode[keyof typeof BrowserKeyboardCode];
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'BrowserInputEventName.ts') `
  -Content @'
export const BrowserKeyboardEventName = {
  KeyDown: 'keydown',
  KeyUp: 'keyup'
} as const;

export const BrowserWindowEventName = {
  Blur: 'blur'
} as const;
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'BrowserKeyboardCodeParser.ts') `
  -Content @'
import {
  BrowserKeyboardCode,
  type BrowserKeyboardCode as BrowserKeyboardCodeValue
} from './BrowserKeyboardCode.js';

export interface BrowserKeyboardCodeParser {
  parse(code: string): BrowserKeyboardCodeValue | null;
}

export class DefaultBrowserKeyboardCodeParser implements BrowserKeyboardCodeParser {
  public parse(code: string): BrowserKeyboardCodeValue | null {
    if (code === BrowserKeyboardCode.ArrowUp) return BrowserKeyboardCode.ArrowUp;
    if (code === BrowserKeyboardCode.ArrowDown) return BrowserKeyboardCode.ArrowDown;
    if (code === BrowserKeyboardCode.ArrowLeft) return BrowserKeyboardCode.ArrowLeft;
    if (code === BrowserKeyboardCode.ArrowRight) return BrowserKeyboardCode.ArrowRight;
    if (code === BrowserKeyboardCode.Space) return BrowserKeyboardCode.Space;

    return null;
  }
}
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'PlayerKeyMap.ts') `
  -Content @'
import type { BrowserKeyboardCode } from './BrowserKeyboardCode.js';

export interface PlayerKeyMap {
  readonly moveUp: BrowserKeyboardCode;
  readonly moveDown: BrowserKeyboardCode;
  readonly moveLeft: BrowserKeyboardCode;
  readonly moveRight: BrowserKeyboardCode;
  readonly fire: BrowserKeyboardCode;

  isMapped(code: BrowserKeyboardCode): boolean;
}
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'DefaultPlayerKeyMap.ts') `
  -Content @'
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
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'PlayerInputAxis.ts') `
  -Content @'
export class PlayerInputAxis {
  readonly #negative: boolean;
  readonly #positive: boolean;

  public constructor(options: {
    readonly negative: boolean;
    readonly positive: boolean;
  }) {
    this.#negative = options.negative;
    this.#positive = options.positive;
  }

  public get value(): number {
    if (this.#negative && !this.#positive) return -1;
    if (this.#positive && !this.#negative) return 1;

    return 0;
  }
}
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'PlayerInput.ts') `
  -Content @'
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

export class PlayerInput implements ReactiveController {
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
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'Player.ts') `
  -Content @'
import { customElement } from 'lit/decorators.js';
import { GameObjectSubject } from '../GameObjectSubject.js';
import { PlayerInput } from './PlayerInput.js';

const PlayerElementName = 'game-player';

@customElement(PlayerElementName)
export class Player extends GameObjectSubject {
  readonly #input = new PlayerInput(this);

  public get horizontalAxis(): number {
    return this.#input.horizontalAxis;
  }

  public get verticalAxis(): number {
    return this.#input.verticalAxis;
  }

  public get isFirePressed(): boolean {
    return this.#input.isFirePressed;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PlayerElementName]: Player;
  }
}
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'index.ts') `
  -Content @'
export * from './BrowserInputEventName.js';
export * from './BrowserKeyboardCode.js';
export * from './BrowserKeyboardCodeParser.js';
export * from './DefaultPlayerKeyMap.js';
export * from './Player.js';
export * from './PlayerInput.js';
export * from './PlayerInputAxis.js';
export * from './PlayerKeyMap.js';
'@

Write-CodeFile `
  -Path (Join-Path $InputRoot 'PlayerInput.spec.ts') `
  -Content @'
import { describe, expect, it } from 'vitest';
import { BrowserKeyboardCode } from './BrowserKeyboardCode.js';
import { DefaultBrowserKeyboardCodeParser } from './BrowserKeyboardCodeParser.js';
import { DefaultPlayerKeyMap } from './DefaultPlayerKeyMap.js';
import { PlayerInputAxis } from './PlayerInputAxis.js';

class PlayerInputFixture {
  public readonly parser = new DefaultBrowserKeyboardCodeParser();
  public readonly keyMap = new DefaultPlayerKeyMap();

  public createAxis(negative: boolean, positive: boolean): PlayerInputAxis {
    return new PlayerInputAxis({ negative, positive });
  }
}

describe('Player input', () => {
  it('should parse supported browser keyboard codes', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.parser.parse('ArrowUp')).toBe(BrowserKeyboardCode.ArrowUp);
    expect(fixture.parser.parse('ArrowDown')).toBe(BrowserKeyboardCode.ArrowDown);
    expect(fixture.parser.parse('ArrowLeft')).toBe(BrowserKeyboardCode.ArrowLeft);
    expect(fixture.parser.parse('ArrowRight')).toBe(BrowserKeyboardCode.ArrowRight);
    expect(fixture.parser.parse('Space')).toBe(BrowserKeyboardCode.Space);
  });

  it('should reject unsupported browser keyboard codes', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.parser.parse('Escape')).toBeNull();
  });

  it('should map only player action keys', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.keyMap.isMapped(BrowserKeyboardCode.ArrowUp)).toBe(true);
    expect(fixture.keyMap.isMapped(BrowserKeyboardCode.ArrowDown)).toBe(true);
    expect(fixture.keyMap.isMapped(BrowserKeyboardCode.ArrowLeft)).toBe(true);
    expect(fixture.keyMap.isMapped(BrowserKeyboardCode.ArrowRight)).toBe(true);
    expect(fixture.keyMap.isMapped(BrowserKeyboardCode.Space)).toBe(true);
  });

  it('should return negative axis value when only negative input is active', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.createAxis(true, false).value).toBe(-1);
  });

  it('should return positive axis value when only positive input is active', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.createAxis(false, true).value).toBe(1);
  });

  it('should return neutral axis value when both directions have equal state', () => {
    const fixture = new PlayerInputFixture();

    expect(fixture.createAxis(false, false).value).toBe(0);
    expect(fixture.createAxis(true, true).value).toBe(0);
  });
});
'@

Remove-StaleFile -Path (Join-Path $InputRoot 'playerControl.ts')

if (-not $SkipBuild) {
  pnpm build
}

if (-not $SkipTests) {
  $PackageJsonPath = Join-Path $Root 'package.json'

  if (Test-Path $PackageJsonPath) {
    $PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json

    if ($PackageJson.scripts.test) {
      pnpm test -- --run
    }
  }
}