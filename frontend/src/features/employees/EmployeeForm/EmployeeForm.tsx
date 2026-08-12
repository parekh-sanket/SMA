import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import type { Employee, EmploymentType } from '../../../types/models';
import { createEmployee, DuplicateEmailError } from '../api';
import { COUNTRIES, DEPARTMENTS } from '../referenceData';

interface EmployeeFormProps {
  onCreated?: (employee: Employee) => void;
}

interface FormState {
  name: string;
  email: string;
  department: string;
  country: string;
  title: string;
  hireDate: string;
  employmentType: string;
  salary: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  department: '',
  country: '',
  title: '',
  hireDate: '',
  employmentType: '',
  salary: '',
};

const REQUIRED_FIELDS = Object.keys(EMPTY) as (keyof FormState)[];
const EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contractor'];

export default function EmployeeForm({ onCreated }: EmployeeFormProps) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    for (const field of REQUIRED_FIELDS) {
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
      const employee = await createEmployee({
        name: values.name,
        email: values.email,
        department: values.department,
        country: values.country,
        title: values.title,
        hireDate: values.hireDate,
        employmentType: values.employmentType as EmploymentType,
        salary: Number(values.salary),
      });
      onCreated?.(employee);
      setValues(EMPTY);
    } catch (err) {
      setSubmitError(
        err instanceof DuplicateEmailError
          ? 'An employee with this email already exists'
          : 'Failed to create employee'
      );
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
        <TextField
          label="Email"
          value={values.email}
          onChange={setField('email')}
          error={!!errors.email}
          helperText={errors.email}
        />
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
          value={values.hireDate}
          onChange={setField('hireDate')}
          error={!!errors.hireDate}
          helperText={errors.hireDate}
          placeholder="YYYY-MM-DD"
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
              {type}
            </option>
          ))}
        </TextField>
        <TextField
          label="Salary (USD)"
          type="number"
          value={values.salary}
          onChange={setField('salary')}
          error={!!errors.salary}
          helperText={errors.salary}
        />

        <Button type="submit" variant="contained">
          Add Employee
        </Button>
      </Stack>
    </Box>
  );
}
