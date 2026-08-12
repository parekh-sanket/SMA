import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { InvalidCredentialsError, login } from '../api';

interface LoginPageProps {
  onLoggedIn?: () => void;
}

export default function LoginPage({ onLoggedIn }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      onLoggedIn?.();
    } catch (err) {
      setError(
        err instanceof InvalidCredentialsError
          ? 'Invalid username or password'
          : 'Login failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, sm: 8 } }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 380 }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Sign in
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            Sign In
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
