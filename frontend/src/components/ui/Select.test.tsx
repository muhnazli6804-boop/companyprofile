import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('label terhubung ke kolom walau tanpa prop id', () => {
    render(<Select label="Status" options={[{ label: 'Semua', value: '' }]} />);

    expect(screen.getByLabelText('Status')).toBeInstanceOf(HTMLSelectElement);
  });

  it('dua Select tanpa id tidak saling menimpa label', () => {
    render(
      <>
        <Select label="Status" options={[{ label: 'Semua', value: '' }]} />
        <Select label="Role" options={[{ label: 'Semua', value: '' }]} />
      </>,
    );

    expect(screen.getByLabelText('Status')).not.toBe(screen.getByLabelText('Role'));
  });

  it('id yang diberikan tetap dipakai', () => {
    render(<Select id="pilih" label="Status" options={[]} />);

    expect(screen.getByLabelText('Status')).toHaveAttribute('id', 'pilih');
  });
});
