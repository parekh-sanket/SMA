import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryRoleInsights from './CountryRoleInsights';

const countryStats = {
  count: 5,
  minMinor: 100000, minFormatted: '$1,000.00',
  maxMinor: 500000, maxFormatted: '$5,000.00',
  averageMinor: 300000, averageFormatted: '$3,000.00',
};

const roleStats = {
  count: 2,
  minMinor: 350000, minFormatted: '$3,500.00',
  maxMinor: 450000, maxFormatted: '$4,500.00',
  averageMinor: 400000, averageFormatted: '$4,000.00',
};

function json(data: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: async () => data } as Response);
}

function setupFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    return json(url.includes('title=') ? roleStats : countryStats);
  });
}

function renderPanel() {
  return render(
    <CountryRoleInsights countries={['US', 'IN']} titles={['Engineer', 'Analyst']} />
  );
}

describe('CountryRoleInsights', () => {
  const originalFetch = global.fetch;

  beforeEach(() => setupFetch());
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('starts empty and shows min/max/avg only after a country is selected', async () => {
    const user = userEvent.setup();
    renderPanel();

    // nothing selected -> no cards
    expect(screen.queryByText('$1,000.00')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/country/i), 'US');

    expect(await screen.findByText('$1,000.00')).toBeInTheDocument(); // min
    expect(screen.getByText('$5,000.00')).toBeInTheDocument(); // max
    expect(screen.getByText('$3,000.00')).toBeInTheDocument(); // avg
  });

  it('shows the role average and matched count when a job title is picked', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');
    await screen.findByText('$1,000.00');

    await user.selectOptions(screen.getByLabelText(/job title/i), 'Engineer');

    expect(await screen.findByText('$4,000.00')).toBeInTheDocument(); // role avg
    expect(screen.getByText(/employees matched/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // matched count

    await waitFor(() =>
      expect(
        (global.fetch as jest.Mock).mock.calls.some((c) =>
          String(c[0]).includes('title=Engineer')
        )
      ).toBe(true)
    );
  });

  it('clears the job title filter with the clear button', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');
    await user.selectOptions(screen.getByLabelText(/job title/i), 'Engineer');
    expect(await screen.findByText('$4,000.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear job title/i }));

    await waitFor(() =>
      expect(screen.queryByText('$4,000.00')).not.toBeInTheDocument()
    );
  });

  it('clears the country filter with the clear button', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');
    expect(await screen.findByText('$1,000.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear country/i }));

    await waitFor(() =>
      expect(screen.queryByText('$1,000.00')).not.toBeInTheDocument()
    );
  });

  it('disables the job title until a country is selected', async () => {
    const user = userEvent.setup();
    renderPanel();

    expect(screen.getByLabelText(/job title/i)).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/country/i), 'US');
    await screen.findByText('$1,000.00');
    expect(screen.getByLabelText(/job title/i)).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /clear country/i }));
    expect(screen.getByLabelText(/job title/i)).toBeDisabled();
  });
});
