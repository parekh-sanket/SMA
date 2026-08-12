import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { clearToken, setToken } from './features/auth/token';

function setupFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/health')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ status: 'ok' }) } as Response);
    }
    if (url.includes('/api/employees/facets')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ departments: [], countries: [], titles: [] }) } as Response);
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: [], page: 1, pageSize: 25, total: 0 }),
    } as Response);
  });
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App auth', () => {
  const originalFetch = global.fetch;

  beforeEach(() => setupFetch());
  afterEach(() => {
    global.fetch = originalFetch;
    clearToken();
  });

  it('redirects to /login when not authenticated', async () => {
    clearToken();

    renderAt('/employees');

    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
  });

  it('shows the directory when authenticated', async () => {
    setToken('test-token');

    renderAt('/employees');

    expect(
      await screen.findByRole('heading', { name: /^employees$/i })
    ).toBeInTheDocument();
  });
});
