import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import type { Employee } from '../../../types/models';
import EmployeeForm from '../EmployeeForm';

export default function NewEmployeePage() {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Employee
      </Typography>
      <EmployeeForm onCreated={(e: Employee) => navigate(`/employees/${e.id}`)} />
    </>
  );
}
