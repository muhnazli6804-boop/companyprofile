import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('menampilkan halaman dan total, di dalam navigasi bernama', () => {
    render(<Pagination currentPage={2} totalPages={5} total={73} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Paginasi' })).toBeInTheDocument();
    expect(screen.getByText('Halaman 2 dari 5')).toBeInTheDocument();
    expect(screen.getByText('73 data')).toBeInTheDocument();
  });

  it('tombol memanggil onPageChange dengan halaman tetangga', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Sebelumnya' }));
    await user.click(screen.getByRole('button', { name: 'Selanjutnya' }));
    expect(onPageChange.mock.calls).toEqual([[1], [3]]);
  });

  it('batas: Sebelumnya mati di halaman 1, Selanjutnya mati di halaman terakhir', () => {
    const { rerender } = render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Sebelumnya' })).toBeDisabled();
    rerender(<Pagination currentPage={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Selanjutnya' })).toBeDisabled();
  });
});
