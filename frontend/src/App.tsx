import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, Route, Routes } from 'react-router-dom';
import BackendStatus from './components/BackendStatus';
import EmployeeDirectory from './features/employees/EmployeeDirectory';
import EmployeeDetailPage from './features/employees/pages/EmployeeDetailPage';
import EditEmployeePage from './features/employees/pages/EditEmployeePage';
import NewEmployeePage from './features/employees/pages/NewEmployeePage';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';

export default function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" component="h1" sx={{ mr: 2 }}>
            Salary Management
          </Typography>
          <Button color="inherit" component={RouterLink} to="/employees">
            Directory
          </Button>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <BackendStatus />
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/employees/new" element={<NewEmployeePage />} />
          <Route path="/employees/:id/edit" element={<EditEmployeePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/dashboard" element={<AnalyticsDashboard />} />
        </Routes>
      </Container>
    </Box>
  );
}
