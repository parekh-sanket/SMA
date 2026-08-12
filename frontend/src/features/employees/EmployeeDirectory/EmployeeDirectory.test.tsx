import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EmployeeDirectory from './EmployeeDirectory';
import type { Employee } from '../../../types/models';

const alice: Employee = {
  id: 'e1',
  name: 'Alice',
  email: 'alice@x.test',
  department: 'Engineering',
  country: 'US',
  title: 'Engineer',
  hireDate: '2021-01-01',
  employmentType: 'full-time',
  status: 'active',
  managerId: null,
  salaryMinor: 300000,
  salaryFormatted: '$3,000.00',
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
};

const bob: Employee = {
  ...alice,
  id: 'e2',
  name: 'Bob',
  email: 'bob@x.test',
  department: 'Sales',
  country: 'IN',
  salaryMinor: 500000,
  salaryFormatted: '$5,000.00',
};

function json(data: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: async () => data } as Response);
}

function setupFetch({ total = 2 }: { total?: number } = {}) {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/employees/facets')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ departments: ['Engineering', 'Sales'], countries: ['IN', 'US'] }),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: [alice, bob], page: 1, pageSize: 25, total }),
    } as Response);
  });
}

function listUrls(): string[] {
  return (global.fetch as jest.Mock).mock.calls
    .map((c) => String(c[0]))
    .filter((u) => u.includes('/api/employees') && !u.includes('/facets'));
}

function renderDirectory() {
  return render(
    <MemoryRouter>
      <EmployeeDirectory />
    </MemoryRouter>
  );
}

describe('EmployeeDirectory', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads and displays employees from the API', async () => {
    setupFetch();
    renderDirectory();

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(listUrls().length).toBeGreaterThan(0);
  });

  it('shows an empty message when there are no employees', async () => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/employees/facets')) {
        return json({ departments: [], countries: [], titles: [] });
      }
      return json({ data: [], page: 1, pageSize: 25, total: 0 });
    });
    renderDirectory();

    expect(await screen.findByText(/no employees found/i)).toBeInTheDocument();
  });

  it('shows an error message when the list request fails', async () => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/employees/facets')) {
        return json({ departments: [], countries: [], titles: [] });
      }
      return Promise.resolve({ ok: false, status: 500, json: async () => ({}) } as Response);
    });
    renderDirectory();

    expect(await screen.findByText(/failed to load employees/i)).toBeInTheDocument();
  });

  it('searches by typing in the search box', async () => {
    setupFetch();
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByText('Alice');

    await user.type(screen.getByLabelText(/search/i), 'bob');

    await waitFor(() =>
      expect(listUrls().some((u) => u.includes('q=bob'))).toBe(true)
    );
  });

  it('filters by department', async () => {
    setupFetch();
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByText('Alice');

    await user.selectOptions(screen.getByLabelText(/department/i), 'Engineering');

    await waitFor(() =>
      expect(listUrls().some((u) => u.includes('department=Engineering'))).toBe(true)
    );
  });

  it('sorts by salary when the Salary column header is clicked', async () => {
    setupFetch();
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByText('Alice');

    await user.click(screen.getByRole('button', { name: /salary/i }));

    await waitFor(() =>
      expect(listUrls().some((u) => u.includes('sortBy=salary'))).toBe(true)
    );
  });

  it('navigates to the next page', async () => {
    setupFetch({ total: 60 });
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByText('Alice');

    await user.click(screen.getByRole('button', { name: /next page/i }));

    await waitFor(() =>
      expect(listUrls().some((u) => u.includes('page=2'))).toBe(true)
    );
  });
});
