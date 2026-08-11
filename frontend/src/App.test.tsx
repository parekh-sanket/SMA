import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function setupFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/health')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ status: 'ok' }) } as Response);
    }
    if (url.includes('/api/employees/facets')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ departments: [], countries: [] }) } as Response);
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

describe('App routing', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setupFetch();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the app title', async () => {
    renderAt('/employees');

    expect(await screen.findByRole('heading', { name: /^employees$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /salary management/i })
    ).toBeInTheDocument();
  });

  it('shows the directory at /employees', async () => {
    renderAt('/employees');

    expect(await screen.findByRole('heading', { name: /^employees$/i })).toBeInTheDocument();
  });

  it('shows the add-employee form at /employees/new', async () => {
    renderAt('/employees/new');

    expect(
      await screen.findByRole('button', { name: /add employee/i })
    ).toBeInTheDocument();
  });

  it('redirects the index route to the directory', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: /^employees$/i })).toBeInTheDocument();
  });
});
