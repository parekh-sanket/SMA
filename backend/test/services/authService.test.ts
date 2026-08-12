import { assertSecureAuthConfig } from '../../src/services/authService';

describe('assertSecureAuthConfig', () => {
  it('passes outside production regardless of defaults', () => {
    expect(() => assertSecureAuthConfig({ NODE_ENV: 'development' })).not.toThrow();
  });

  it('throws in production with the default admin password', () => {
    expect(() =>
      assertSecureAuthConfig({ NODE_ENV: 'production', ADMIN_PASSWORD: 'admin', JWT_SECRET: 'x' })
    ).toThrow(/ADMIN_PASSWORD/);
  });

  it('throws in production with the default JWT secret', () => {
    expect(() =>
      assertSecureAuthConfig({
        NODE_ENV: 'production',
        ADMIN_PASSWORD: 'strong-pass',
        JWT_SECRET: 'dev-secret-change-me',
      })
    ).toThrow(/JWT_SECRET/);
  });

  it('passes in production with real secrets', () => {
    expect(() =>
      assertSecureAuthConfig({
        NODE_ENV: 'production',
        ADMIN_PASSWORD: 'strong-pass',
        JWT_SECRET: 'a-long-random-secret',
      })
    ).not.toThrow();
  });
});
