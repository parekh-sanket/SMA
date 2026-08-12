import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress, Paper, Typography } from '@mui/material';
import type { Employee } from '../../../types/models';
import EmployeeForm from '../EmployeeForm';
import { EmployeeNotFoundError, getEmployee } from '../api';

type State =
  | { kind: 'loading' }
  | { kind: 'loaded'; employee: Employee }
  | { kind: 'not-found' }
  | { kind: 'error' };

export default function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (!id) return;
    let active = true;
    getEmployee(id)
      .then((employee) => {
        if (active) setState({ kind: 'loaded', employee });
      })
      .catch((err) => {
        if (!active) return;
        setState(
          err instanceof EmployeeNotFoundError ? { kind: 'not-found' } : { kind: 'error' }
        );
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!id) return null;
  if (state.kind === 'loading') return <CircularProgress aria-label="Loading" />;
  if (state.kind === 'not-found') return <Typography>Employee not found</Typography>;
  if (state.kind === 'error') return <Typography>Something went wrong</Typography>;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Edit Employee
      </Typography>
      <EmployeeForm
        mode="edit"
        employee={state.employee}
        onUpdated={(e) => navigate(`/employees/${e.id}`)}
        onCancel={() => navigate(`/employees/${id}`)}
      />
    </Paper>
  );
}
