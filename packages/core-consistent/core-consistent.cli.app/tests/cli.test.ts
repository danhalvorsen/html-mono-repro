import { describe, it, expect } from 'vitest';
import { createCliRunner } from '../src/app.js';

describe('core-consistent CLI runner', () => {
  const dependencies = {
    validateFile: (filePath: string) => ({
      valid: filePath.includes('good'),
      errors: filePath.includes('bad') ? [{ message: 'invalid' }] : [],
    }),
    computeFingerprint: () => 'deadbeef',
  };

  it('reports a successful validation', async () => {
    const runner = createCliRunner(dependencies);
    const execution = await runner.executeArgs(['validate-tsconfig', '--file', 'good.tsconfig.json']);
    expect((execution.result as { valid: boolean }).valid).toBe(true);
  });

  it('captures validation failures', async () => {
    const runner = createCliRunner(dependencies);
    const execution = await runner.executeArgs(['validate-tsconfig', '--file', 'bad.tsconfig.json']);
    expect((execution.result as { valid: boolean }).valid).toBe(false);
    expect(((execution.result as { errors: string[] }).errors ?? []).length).toBeGreaterThan(0);
  });

  it('computes fingerprints via the handler', async () => {
    const runner = createCliRunner(dependencies);
    const execution = await runner.executeArgs(['compute-fp', 'tsconfig.json']);
    expect(execution.result).toBe('deadbeef');
  });
});
