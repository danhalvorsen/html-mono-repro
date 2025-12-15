import config from '../vitest.config';

describe('vitest root configuration', () => {
  it('exports a config with test settings', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config.test).toBeDefined();
    expect(config.test).toHaveProperty('include');
    expect(Array.isArray(config.test.include)).toBe(true);
  });
});
