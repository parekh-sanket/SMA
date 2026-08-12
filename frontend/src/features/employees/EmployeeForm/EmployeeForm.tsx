import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import type {
  Employee,
  EmployeeStatus,
  EmploymentType,
} from '../../../types/models';
import { createEmployee, DuplicateEmailError, updateEmployee } from '../api';
import { COUNTRIES, DEPARTMENTS } from '../referenceData';
import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS } from '../labels';

interface EmployeeFormProps {
  mode?: 'create' | 'edit';
  employee?: Employee;
  onCreated?: (employee: Employee) => void;
  onUpdated?: (employee: Employee) => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  email: string;
  department: string;
  country: string;
  title: string;
  hireDate: string;
  employmentType: string;
  status: string;
  salary: string;
}

const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contractor'];
const STATUSES: EmployeeStatus[] = ['active', 'terminated'];

function initialState(employee?: Employee): FormState {
  return {
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    department: employee?.department ?? '',
    country: employee?.country ?? '',
    title: employee?.title ?? '',
    hireDate: employee?.hireDate ?? '',
    employmentType: employee?.employmentType ?? '',
    status: employee?.status ?? '',
    salary: '',
  };
}

export default function EmployeeForm({
  mode = 'create',
  employee,
  onCreated,
  onUpdated,
  onCancel,
}: EmployeeFormProps) {
  const isEdit = mode === 'edit';
  const [values, setValues] = useState<FormState>(() => initialState(employee));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requiredFields: (keyof FormState)[] = isEdit
    ? ['name', 'department', 'country', 'title', 'hireDate', 'employmentType', 'status']
    : ['name', 'email', 'department', 'country', 'title', 'hireDate', 'employmentType', 'salary'];

  const setField =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    for (const field of requiredFields) {
      if (!values[field].trim()) next[field] = 'This field is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      if (isEdit && employee) {
        const updated = await updateEmployee(employee.id, {
          name: values.name,
          department: values.department,
          country: values.country,
          title: values.title,
          hireDate: values.hireDate,
          employmentType: values.employmentType as EmploymentType,
          status: values.status as EmployeeStatus,
          managerId: employee.managerId,
        });
        onUpdated?.(updated);
      } else {
        const created = await createEmployee({
          name: values.name,
          email: values.email,
          department: values.department,
          country: values.country,
          title: values.title,
          hireDate: values.hireDate,
          employmentType: values.employmentType as EmploymentType,
          salary: Number(values.salary),
        });
        onCreated?.(created);
        setValues(initialState());
      }
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setSubmitError('An employee with this email already exists');
      } else {
        setSubmitError(isEdit ? 'Failed to update employee' : 'Failed to create employee');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        <TextField
          label="Name"
          value={values.name}
          onChange={setField('name')}
          error={!!errors.name}
          helperText={errors.name}
        />

        {!isEdit && (
          <TextField
            label="Email"
            value={values.email}
            onChange={setField('email')}
            error={!!errors.email}
            helperText={errors.email}
          />
        )}

        <TextField
          label="Department"
          value={values.department}
          onChange={setField('department')}
          error={!!errors.department}
          helperText={errors.department}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="" aria-label="none" />
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </TextField>

        <TextField
          label="Country"
          value={values.country}
          onChange={setField('country')}
          error={!!errors.country}
          helperText={errors.country}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="" aria-label="none" />
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </TextField>

        <TextField
          label="Title"
          value={values.title}
          onChange={setField('title')}
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          label="Hire Date"
          type="date"
          value={values.hireDate}
          onChange={setField('hireDate')}
          error={!!errors.hireDate}
          helperText={errors.hireDate}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Employment Type"
          value={values.employmentType}
          onChange={setField('employmentType')}
          error={!!errors.employmentType}
          helperText={errors.employmentType}
          select
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="" aria-label="none" />
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMPLOYMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </TextField>

        {isEdit && (
          <TextField
            label="Status"
            value={values.status}
            onChange={setField('status')}
            error={!!errors.status}
            helperText={errors.status}
            select
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
          >
            <option value="" aria-label="none" />
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </TextField>
        )}

        {!isEdit && (
          <TextField
            label="Salary (USD)"
            type="number"
            value={values.salary}
            onChange={setField('salary')}
            error={!!errors.salary}
            helperText={errors.salary}
          />
        )}

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
