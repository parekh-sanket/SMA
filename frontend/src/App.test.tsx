import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import type { Employee } from './types/models';

const appEmployee: Employee = {
  id: 'emp-1',
  name: 'Ada Lovelace',
  email: 'ada@acme.test',
  department: 'Engineering',
  country: 'US',
  title: 'Staff Engineer',
  hireDate: '2021-05-01',
  employmentType: 'full-time',
  status: 'active',
  managerId: null,
  salaryMinor: 8500050,
  salaryFormatted: '$85,000.50',
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
};

function setupFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/health')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ status: 'ok' }) } as Response);
    }
    if (url.includes('/api/employees/facets')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ departments: [], countries: [] }) } as Response);
    }
    if (url.includes('/api/analytics/summary')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          headcount: 0, totalPayrollMinor: 0, totalPayrollFormatted: '$0.00',
          averageMinor: 0, averageFormatted: '$0.00', medianMinor: 0, medianFormatted: '$0.00',
        }),
      } as Response);
    }
    if (url.includes('/api/analytics/distribution')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ bucketSizeMinor: 1000000, buckets: [] }) } as Response);
    }
    if (url.includes('/api/analytics/breakdown') || url.includes('/api/analytics/top-earners')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => [] } as Response);
    }
    // A single-segment /api/employees/<id> (no query) is a detail fetch.
    if (/\/api\/employees\/[^/?]+$/.test(url)) {
      return Promise.resolve({ ok: true, status: 200, json: async () => appEmployee } as Response);
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

  it('shows the edit form at /employees/:id/edit', async () => {
    renderAt('/employees/emp-1/edit');

    expect(
      await screen.findByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it('shows the dashboard at /dashboard', async () => {
    renderAt('/dashboard');

    expect(
      await screen.findByRole('heading', { name: /dashboard/i })
    ).toBeInTheDocument();
  });
});
