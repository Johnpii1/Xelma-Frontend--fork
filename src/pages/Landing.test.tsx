import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

describe('Landing Page', () => {
  it('renders hero section with headline and subtitle', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const heroHeading = screen.getByRole('heading', { level: 1 });
    expect(heroHeading).toHaveTextContent(/read the market/i);
    expect(heroHeading).toHaveTextContent(/prove your call/i);
    expect(screen.getByText(/stellar prediction infrastructure/i)).toBeInTheDocument();
  });

  it('renders primary CTA linking to dashboard', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const primaryCta = screen.getByRole('link', { name: /enter prediction terminal/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute('href', '/dashboard');
  });

  it('renders secondary CTA linking to how it works section', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const secondaryCta = screen.getByRole('link', { name: /how it works/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute('href', '#how-it-works');
  });

  it('renders stats section with expected metric labels', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/rounds resolved/i)).toBeInTheDocument();
    expect(screen.getByText(/practice volume/i)).toBeInTheDocument();
    expect(screen.getByText(/active predictors/i)).toBeInTheDocument();
  });

  it('displays key landing content sections visible to users', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    // How It Works section
    expect(screen.getByRole('heading', { name: /^how it works$/i })).toBeInTheDocument();
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    expect(screen.getByText(/start with practice vxlm/i)).toBeInTheDocument();

    // Prediction Modes section
    expect(screen.getByRole('heading', { name: /two prediction modes/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /up\/down mode/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /precision mode/i })).toBeInTheDocument();
  });
});
