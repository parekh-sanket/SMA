import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import BackendStatus from './components/BackendStatus';
import EmployeeDirectory from './features/employees/EmployeeDirectory';
import EmployeeDetailPage from './features/employees/pages/EmployeeDetailPage';
import NewEmployeePage from './features/employees/pages/NewEmployeePage';

export default function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Salary Management
          </Typography>
          <BackendStatus />
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/employees/new" element={<NewEmployeePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        </Routes>
      </Container>
    </Box>
  );
}
