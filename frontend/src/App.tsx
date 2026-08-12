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
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              mr: { xs: 0.5, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            Salary Management
          </Typography>
          <Button
            color="inherit"
            size="small"
            component={RouterLink}
            to="/employees"
            sx={{ flexShrink: 0 }}
          >
            Directory
          </Button>
          <Button
            color="inherit"
            size="small"
            component={RouterLink}
            to="/dashboard"
            sx={{ flexShrink: 0 }}
          >
            Dashboard
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <BackendStatus />
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 } }}>
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
