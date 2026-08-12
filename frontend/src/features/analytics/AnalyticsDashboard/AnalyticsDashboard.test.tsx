import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { Employee } from '../../../types/models';

const summary = {
  headcount: 3,
  totalPayrollMinor: 3000000,
  totalPayrollFormatted: '$30,000.00',
  averageMinor: 1000000,
  averageFormatted: '$10,000.00',
  medianMinor: 1000000,
  medianFormatted: '$10,000.00',
};

const deptBreakdown = [
  { key: 'Engineering', count: 2, totalMinor: 1500000, totalFormatted: '$15,000.00', averageMinor: 750000, averageFormatted: '$7,500.00' },
  { key: 'Sales', count: 1, totalMinor: 1500000, totalFormatted: '$15,000.00', averageMinor: 1500000, averageFormatted: '$15,000.00' },
];

const countryBreakdown = [
  { key: 'US', count: 2, totalMinor: 2500000, totalFormatted: '$25,000.00', averageMinor: 1250000, averageFormatted: '$12,500.00' },
  { key: 'IN', count: 1, totalMinor: 500000, totalFormatted: '$5,000.00', averageMinor: 500000, averageFormatted: '$5,000.00' },
];

function emp(over: Partial<Employee>): Employee {
  return {
    id: 'x', name: 'X', email: 'x@x.test', department: 'Engineering', country: 'US',
    title: 'E', hireDate: '2021-01-01', employmentType: 'full-time', status: 'active',
    managerId: null, salaryMinor: 0, salaryFormatted: '$0.00', createdAt: '', updatedAt: '',
    ...over,
  };
}

const topEarners = [
  emp({ id: 'g', name: 'Grace Hopper', salaryFormatted: '$15,000.00' }),
  emp({ id: 'a', name: 'Ada Lovelace', salaryFormatted: '$10,000.00' }),
];

const distribution = {
  bucketSizeMinor: 1000000,
  buckets: [
    { start: 0, end: 1000000, count: 1 },
    { start: 1000000, end: 2000000, count: 2 },
  ],
};

function json(data: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: async () => data } as Response);
}

function setupFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/analytics/summary')) return json(summary);
    if (url.includes('/api/analytics/breakdown')) {
      return json(url.includes('dimension=country') ? countryBreakdown : deptBreakdown);
    }
    if (url.includes('/api/analytics/top-earners')) return json(topEarners);
    if (url.includes('/api/analytics/distribution')) return json(distribution);
    return json({});
  });
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AnalyticsDashboard />
    </MemoryRouter>
  );
}

describe('AnalyticsDashboard', () => {
  const originalFetch = global.fetch;

  beforeEach(() => setupFetch());
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows the org summary', async () => {
    renderDashboard();

    expect(await screen.findByText('$30,000.00')).toBeInTheDocument();
    expect(screen.getByText(/headcount/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/median/i)).toBeInTheDocument();
  });

  it('shows the department breakdown and toggles to country', async () => {
    const user = userEvent.setup();
    renderDashboard();

    expect(await screen.findByText('Engineering')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /country/i }));

    expect(await screen.findByText('US')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        (global.fetch as jest.Mock).mock.calls.some((c) =>
          String(c[0]).includes('dimension=country')
        )
      ).toBe(true)
    );
  });

  it('shows the top earners', async () => {
    renderDashboard();

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('shows the salary distribution', async () => {
    renderDashboard();

    expect(await screen.findByText(/salary distribution/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/salary band/i)).toHaveLength(2);
  });
});
