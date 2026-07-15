import { describe, it, expect } from 'vitest';
import { TESTING_VERSION } from './index';

describe('testing package', () => {
  it('should export the version', () => {
    expect(TESTING_VERSION).toBe('0.1.0');
  });
});
