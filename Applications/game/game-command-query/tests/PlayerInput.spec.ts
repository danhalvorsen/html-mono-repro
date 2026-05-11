import { describe, expect, it } from 'vitest';
import {DefaultBrowserKeyboardCodeParser, DefaultPlayerKeyMap, BrowserKeyboardCode, PlayerInputAxis} from '../src/index.js';
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