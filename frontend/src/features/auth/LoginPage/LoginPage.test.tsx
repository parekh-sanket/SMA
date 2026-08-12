import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { clearToken, getToken } from '../token';

describe('LoginPage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearToken();
  });

  it('signs in, stores the token, and calls onLoggedIn', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'jwt-123' }),
    } as Response);
    const onLoggedIn = jest.fn();
    render(<LoginPage onLoggedIn={onLoggedIn} />);

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'admin');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onLoggedIn).toHaveBeenCalled());
    expect(getToken()).toBe('jwt-123');

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ username: 'admin', password: 'admin' });
  });

  it('shows an error for invalid credentials', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'InvalidCredentials' }),
    } as Response);
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid|incorrect|failed/i)
    ).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });
});
