import { describe, it, expect } from 'vitest';
import { REACT_PACKAGE_VERSION } from './index';

describe('react package', () => {
  it('should export the version', () => {
    expect(REACT_PACKAGE_VERSION).toBe('0.1.0');
  });
});
