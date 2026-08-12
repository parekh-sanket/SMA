import { setToken } from './token';

/** Thrown when the credentials are rejected (401). */
export class InvalidCredentialsError extends Error {}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) {
    throw new InvalidCredentialsError('Invalid credentials');
  }
  if (!res.ok) {
    throw new Error(`Login failed (${res.status})`);
  }
  const data = (await res.json()) as { token: string };
  setToken(data.token);
}
