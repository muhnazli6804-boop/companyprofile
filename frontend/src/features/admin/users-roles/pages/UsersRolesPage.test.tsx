import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersRolesPage from './UsersRolesPage';
import { SUPER_ME, mockGet, renderWithProviders } from '../test-helpers';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGet(SUPER_ME);
});

describe('UsersRolesPage', () => {
  it('membuka tab Pengguna secara bawaan', async () => {
    renderWithProviders(<UsersRolesPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Pengguna & Role' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pengguna' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('Sari Konten')).toBeInTheDocument();
  });

  it('?tab=role membuka tab Role & Permission', async () => {
    renderWithProviders(<UsersRolesPage />, '/admin/pengguna?tab=role');

    expect(screen.getByRole('tab', { name: 'Role & Permission' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByRole('checkbox', { name: 'Mengelola Konten — Admin Konten' })).toBeInTheDocument();
  });

  it('klik tab berpindah panel; panah kanan memindah tab dan fokus', async () => {
    renderWithProviders(<UsersRolesPage />);
    const user = userEvent.setup();
    await screen.findByText('Sari Konten');

    await user.click(screen.getByRole('tab', { name: 'Role & Permission' }));
    expect(await screen.findByRole('checkbox', { name: 'Mengelola Konten — Admin Konten' })).toBeInTheDocument();
    expect(screen.queryByText('Sari Konten')).not.toBeInTheDocument();

    screen.getByRole('tab', { name: 'Role & Permission' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Pengguna' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Pengguna' })).toHaveAttribute('aria-selected', 'true');
  });
});
