import { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import type { Employee } from '../../../types/models';
import { EmployeeNotFoundError, getEmployee } from '../api';

interface EmployeeDetailProps {
  employeeId: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'loaded'; employee: Employee }
  | { kind: 'not-found' }
  | { kind: 'error' };

export default function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ kind: 'loading' });
    getEmployee(employeeId)
      .then((employee) => {
        if (active) setState({ kind: 'loaded', employee });
      })
      .catch((err) => {
        if (!active) return;
        setState(
          err instanceof EmployeeNotFoundError
            ? { kind: 'not-found' }
            : { kind: 'error' }
        );
      });
    return () => {
      active = false;
    };
  }, [employeeId]);

  if (state.kind === 'loading') return <CircularProgress aria-label="Loading" />;
  if (state.kind === 'not-found') return <Typography>Employee not found</Typography>;
  if (state.kind === 'error') return <Typography>Something went wrong</Typography>;

  const e = state.employee;
  return (
    <Box>
      <Typography variant="h4" component="h1">
        {e.name}
      </Typography>
      <Typography color="text.secondary">{e.title}</Typography>

      <Stack direction="row" spacing={1} sx={{ my: 1.5 }}>
        <Chip label={e.employmentType} />
        <Chip
          label={e.status}
          color={e.status === 'active' ? 'success' : 'default'}
        />
      </Stack>

      <Field label="Email" value={e.email} />
      <Field label="Department" value={e.department} />
      <Field label="Country" value={e.country} />
      <Field label="Hire date" value={e.hireDate} />
      <Field label="Salary" value={e.salaryFormatted} />
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography component="span" color="text.secondary" sx={{ minWidth: 96 }}>
        {label}
      </Typography>
      <Typography component="span">{value}</Typography>
    </Stack>
  );
}
