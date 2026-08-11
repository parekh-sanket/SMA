import { render, screen } from '@testing-library/react';
import EmployeeDetail from './EmployeeDetail';
import type { Employee } from '../../../types/models';

const employee: Employee = {
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

describe('EmployeeDetail', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the employee details from the API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => employee,
    } as Response);

    render(<EmployeeDetail employeeId="emp-1" />);

    expect(
      await screen.findByRole('heading', { name: /ada lovelace/i })
    ).toBeInTheDocument();
    expect(screen.getByText('ada@acme.test')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    expect(screen.getByText('$85,000.50')).toBeInTheDocument();
    expect(screen.getByText(/full-time/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/employees/emp-1');
  });

  it('shows a not-found message when the employee does not exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'NotFound' }),
    } as Response);

    render(<EmployeeDetail employeeId="missing" />);

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });
});
