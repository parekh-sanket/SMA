import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import EmployeeForm from './EmployeeForm';
import type { Employee } from '../../../types/models';

const created: Employee = {
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

async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
  await user.type(screen.getByLabelText(/email/i), 'ada@acme.test');
  await user.selectOptions(screen.getByLabelText(/department/i), 'Engineering');
  await user.selectOptions(screen.getByLabelText(/country/i), 'US');
  await user.type(screen.getByLabelText(/title/i), 'Staff Engineer');
  await user.type(screen.getByLabelText(/hire date/i), '2021-05-01');
  await user.selectOptions(screen.getByLabelText(/employment type/i), 'full-time');
  await user.type(screen.getByLabelText(/salary/i), '85000.50');
}

describe('EmployeeForm', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the form fields', () => {
    render(<EmployeeForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i).tagName).toBe('SELECT');
    expect(screen.getByLabelText(/country/i).tagName).toBe('SELECT');
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hire date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add employee/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors and does not call the API when required fields are empty', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn();
    render(<EmployeeForm />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect((await screen.findAllByText(/required/i)).length).toBeGreaterThan(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits valid data and calls onCreated with the created employee', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => created,
    } as Response);
    const onCreated = jest.fn();
    render(<EmployeeForm onCreated={onCreated} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/employees');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@acme.test',
      department: 'Engineering',
      country: 'US',
      title: 'Staff Engineer',
      hireDate: '2021-05-01',
      employmentType: 'full-time',
      salary: 85000.5,
    });
  });

  it('shows an error when the email is already taken', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'DuplicateEmail' }),
    } as Response);
    render(<EmployeeForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    expect(
      await screen.findByText(/already (exists|taken|registered)/i)
    ).toBeInTheDocument();
  });
});
