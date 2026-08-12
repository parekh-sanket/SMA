import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('adjusts the salary and shows the new value', async () => {
    const user = userEvent.setup();
    const updated: Employee = { ...employee, salaryMinor: 9000000, salaryFormatted: '$90,000.00' };
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => (method === 'PATCH' ? updated : employee),
      } as Response);
    });

    render(<EmployeeDetail employeeId="emp-1" />);
    expect(await screen.findByText('$85,000.50')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /adjust salary/i }));
    await user.type(screen.getByLabelText(/new salary/i), '90000');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('$90,000.00')).toBeInTheDocument();

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      (c) => (c[1]?.method ?? '').toUpperCase() === 'PATCH'
    );
    expect(patchCall?.[0]).toBe('/api/employees/emp-1/salary');
    expect(JSON.parse(patchCall?.[1].body)).toEqual({ salary: 90000 });
  });

  it('invokes the edit and back callbacks', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => employee,
    } as Response);
    const onEdit = jest.fn();
    const onBack = jest.fn();
    render(<EmployeeDetail employeeId="emp-1" onEdit={onEdit} onBack={onBack} />);
    await screen.findByRole('heading', { name: /ada lovelace/i });

    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('deletes the employee after confirmation', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method ?? 'GET').toUpperCase();
      return Promise.resolve({
        ok: true,
        status: method === 'DELETE' ? 204 : 200,
        json: async () => (method === 'DELETE' ? {} : employee),
      } as Response);
    });
    const onDeleted = jest.fn();
    render(<EmployeeDetail employeeId="emp-1" onDeleted={onDeleted} />);
    await screen.findByRole('heading', { name: /ada lovelace/i });

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    const deleteCall = (global.fetch as jest.Mock).mock.calls.find(
      (c) => (c[1]?.method ?? '').toUpperCase() === 'DELETE'
    );
    expect(deleteCall?.[0]).toBe('/api/employees/emp-1');
  });
});
