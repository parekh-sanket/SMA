import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Employee } from '../../../types/models';
import { adjustSalary, EmployeeNotFoundError, getEmployee } from '../api';
import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS } from '../labels';

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
  const [adjusting, setAdjusting] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleSave = async () => {
    setSaveError(null);
    try {
      const updated = await adjustSalary(employeeId, Number(newSalary));
      setState({ kind: 'loaded', employee: updated });
      setAdjusting(false);
    } catch {
      setSaveError('Failed to update salary');
    }
  };

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
        <Chip label={EMPLOYMENT_TYPE_LABELS[e.employmentType]} />
        <Chip
          label={STATUS_LABELS[e.status]}
          color={e.status === 'active' ? 'success' : 'default'}
        />
      </Stack>

      <Field label="Email" value={e.email} />
      <Field label="Department" value={e.department} />
      <Field label="Country" value={e.country} />
      <Field label="Hire date" value={e.hireDate} />

      <Stack direction="row" spacing={1} alignItems="center">
        <Field label="Salary" value={e.salaryFormatted} />
        {!adjusting && (
          <Button
            size="small"
            onClick={() => {
              setAdjusting(true);
              setNewSalary('');
              setSaveError(null);
            }}
          >
            Adjust Salary
          </Button>
        )}
      </Stack>

      {adjusting && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <TextField
            label="New Salary (USD)"
            type="number"
            size="small"
            value={newSalary}
            onChange={(ev) => setNewSalary(ev.target.value)}
          />
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={() => setAdjusting(false)}>Cancel</Button>
        </Stack>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {saveError}
        </Alert>
      )}
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
