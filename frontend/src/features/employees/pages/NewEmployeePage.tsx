import { useNavigate } from 'react-router-dom';
import { Paper, Typography } from '@mui/material';
import type { Employee } from '../../../types/models';
import EmployeeForm from '../EmployeeForm';

export default function NewEmployeePage() {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Employee
      </Typography>
      <EmployeeForm
        onCreated={(e: Employee) => navigate(`/employees/${e.id}`)}
        onCancel={() => navigate('/employees')}
      />
    </Paper>
  );
}
