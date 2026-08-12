import { clearToken, getToken } from './token';

/**
 * fetch wrapper that attaches the bearer token to API calls and drops the token
 * on a 401 so the route guard sends the user back to login.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) clearToken();
  return res;
}
