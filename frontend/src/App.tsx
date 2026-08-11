import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import BackendStatus from './components/BackendStatus';

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
    </Box>
  );
}
