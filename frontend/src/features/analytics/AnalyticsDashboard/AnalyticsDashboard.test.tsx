import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsDashboard from './AnalyticsDashboard';
import type { Employee } from '../../../types/models';

const summary = {
  headcount: 3,
  totalPayrollMinor: 3000000,
  totalPayrollFormatted: '$30,000.00',
  averageMinor: 1000000,
  averageFormatted: '$10,000.00',
  medianMinor: 900000,
  medianFormatted: '$9,000.00',
};

const facets = {
  departments: ['Engineering', 'Sales', 'Product', 'Design'],
  countries: ['US', 'IN'],
};

const deptBreakdown = [
  { key: 'Engineering', count: 2, totalMinor: 1500000, totalFormatted: '$15,000.00', averageMinor: 750000, averageFormatted: '$7,500.00' },
  { key: 'Sales', count: 1, totalMinor: 1500000, totalFormatted: '$15,000.00', averageMinor: 1500000, averageFormatted: '$15,000.00' },
];

const countryBreakdown = [
  { key: 'US', count: 2, totalMinor: 2500000, totalFormatted: '$25,000.00', averageMinor: 1250000, averageFormatted: '$12,500.00' },
  { key: 'IN', count: 1, totalMinor: 500000, totalFormatted: '$5,000.00', averageMinor: 500000, averageFormatted: '$5,000.00' },
];

function emp(id: string, name: string, salaryFormatted: string): Employee {
  return {
    id, name, email: `${id}@x.test`, department: 'Engineering', country: 'US',
    title: 'E', hireDate: '2021-01-01', employmentType: 'full-time', status: 'active',
    managerId: null, salaryMinor: 0, salaryFormatted, createdAt: '', updatedAt: '',
  };
}

const topEarners = [emp('g', 'Grace Hopper', '$15,000.00'), emp('a', 'Ada Lovelace', '$10,000.00')];
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
    if (url.includes('/api/employees/facets')) return json(facets);
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

  it('shows the KPI cards from summary and facets', async () => {
    renderDashboard();

    expect(await screen.findByText('$10,000.00')).toBeInTheDocument(); // average salary
    expect(screen.getByText('$30,000.00')).toBeInTheDocument(); // total payroll
    expect(screen.getByText(/total employees/i)).toBeInTheDocument();
    expect(screen.getByText(/countries/i)).toBeInTheDocument();
    expect(screen.getByText(/departments/i)).toBeInTheDocument();
  });

  it('renders the chart sections and fetches both breakdowns + distribution', async () => {
    renderDashboard();

    expect(await screen.findByText(/salary distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/top paying countries/i)).toBeInTheDocument();
    expect(screen.getByText(/avg salary by department/i)).toBeInTheDocument();

    await waitFor(() => {
      const urls = (global.fetch as jest.Mock).mock.calls.map((c) => String(c[0]));
      expect(urls.some((u) => u.includes('breakdown?dimension=country'))).toBe(true);
      expect(urls.some((u) => u.includes('breakdown?dimension=department'))).toBe(true);
      expect(urls.some((u) => u.includes('/analytics/distribution'))).toBe(true);
    });
  });

  it('shows the top earners', async () => {
    renderDashboard();

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
