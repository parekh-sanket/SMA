import { useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import { fetchHealth } from '../../api/client';

type Status = 'checking' | 'ok' | 'unavailable';

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((res) => {
        if (active) setStatus(res.status === 'ok' ? 'ok' : 'unavailable');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });
    return () => {
      active = false;
    };
  }, []);

  const color = status === 'ok' ? 'success' : status === 'unavailable' ? 'error' : 'default';

  return <Chip color={color} label={`Backend: ${status}`} size="small" />;
}
