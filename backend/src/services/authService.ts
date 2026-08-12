import jwt from 'jsonwebtoken';

/**
 * Simple single-admin authentication. Credentials and signing secret come from
 * the environment, with dev-friendly defaults so local runs work out of the box.
 */
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL = '12h';

/**
 * Fails fast in production if the admin password or JWT secret are left at their
 * insecure development defaults (which would make tokens forgeable).
 */
export function assertSecureAuthConfig(
  env: { NODE_ENV?: string; ADMIN_PASSWORD?: string; JWT_SECRET?: string } = process.env
): void {
  if (env.NODE_ENV !== 'production') return;
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD === 'admin') {
    throw new Error('ADMIN_PASSWORD must be set to a non-default value in production');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a non-default value in production');
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function issueToken(): string {
  return jwt.sign({ sub: ADMIN_USERNAME, role: 'admin' }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
