import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Employee } from '../../../types/models';
import {
  adjustSalary,
  deleteEmployee,
  EmployeeNotFoundError,
  getEmployee,
} from '../api';
import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS } from '../labels';

interface EmployeeDetailProps {
  employeeId: string;
  onEdit?: () => void;
  onDeleted?: () => void;
  onBack?: () => void;
}

type State =
  | { kind: 'loading' }
  | { kind: 'loaded'; employee: Employee }
  | { kind: 'not-found' }
  | { kind: 'error' };

export default function EmployeeDetail({
  employeeId,
  onEdit,
  onDeleted,
  onBack,
}: EmployeeDetailProps) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [adjusting, setAdjusting] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleDelete = async () => {
    try {
      await deleteEmployee(employeeId);
      setConfirmOpen(false);
      onDeleted?.();
    } catch {
      setConfirmOpen(false);
      setSaveError('Failed to delete employee');
    }
  };

  if (state.kind === 'loading') return <CircularProgress aria-label="Loading" />;
  if (state.kind === 'not-found') return <Typography>Employee not found</Typography>;
  if (state.kind === 'error') return <Typography>Something went wrong</Typography>;

  const e = state.employee;
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ wordBreak: 'break-word' }}>
            {e.name}
          </Typography>
          <Typography color="text.secondary">{e.title}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {onBack && (
            <Button size="small" onClick={onBack}>
              Back
            </Button>
          )}
          {onEdit && (
            <Button size="small" variant="outlined" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDeleted && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Chip label={EMPLOYMENT_TYPE_LABELS[e.employmentType]} />
        <Chip
          label={STATUS_LABELS[e.status]}
          color={e.status === 'active' ? 'success' : 'default'}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1}>
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
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
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

        {saveError && <Alert severity="error">{saveError}</Alert>}
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete employee?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes {e.name}. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography
        component="span"
        color="text.secondary"
        sx={{ minWidth: 96, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography component="span" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}
