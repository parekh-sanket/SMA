import { render, screen } from '@testing-library/react';
import BackendStatus from './BackendStatus';

describe('BackendStatus', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows the backend status reported by /api/health', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    } as Response);

    render(<BackendStatus />);

    expect(await screen.findByText(/backend: ok/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/health');
  });

  it('shows unavailable when the health call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    render(<BackendStatus />);

    expect(await screen.findByText(/backend: unavailable/i)).toBeInTheDocument();
  });
});
