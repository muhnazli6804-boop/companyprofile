import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '@/components/data/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders student status label correctly', () => {
    render(<StatusBadge status="submitted" type="student" />);
    expect(screen.getByText('Terkirim')).toBeInTheDocument();
  });

  it('renders accepted status label correctly', () => {
    render(<StatusBadge status="accepted" type="student" />);
    expect(screen.getByText('Diterima')).toBeInTheDocument();
  });
});
