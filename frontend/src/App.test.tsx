import { render, screen } from '@testing-library/react';
import App from './App';

describe('App shell', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the application title', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /salary management/i })
    ).toBeInTheDocument();
    // let the async health check settle so no state update escapes the test
    expect(await screen.findByText(/backend: ok/i)).toBeInTheDocument();
  });
});
