import { describe, expect, it } from 'vitest';
import { hasPermission, isSuperAdmin, roleLabel } from './permissions';

describe('permissions', () => {
  it('hasPermission: benar hanya bila nama permission ada', () => {
    const user = { permissions: ['units.manage'] };
    expect(hasPermission(user, 'units.manage')).toBe(true);
    expect(hasPermission(user, 'users.manage')).toBe(false);
  });

  it('hasPermission: user kosong atau tanpa permissions berarti tidak berhak', () => {
    expect(hasPermission(undefined, 'units.manage')).toBe(false);
    expect(hasPermission({}, 'units.manage')).toBe(false);
  });

  it('isSuperAdmin membaca roles', () => {
    expect(isSuperAdmin({ roles: ['super_admin'] })).toBe(true);
    expect(isSuperAdmin({ roles: ['admin_content'] })).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
  });

  it('roleLabel: label Indonesia untuk role dikenal, nama apa adanya untuk role kustom', () => {
    expect(roleLabel('super_admin')).toBe('Super Admin');
    expect(roleLabel('admin_registration')).toBe('Admin Pendaftaran');
    expect(roleLabel('admin_content')).toBe('Admin Konten');
    expect(roleLabel('bendahara')).toBe('bendahara');
  });
});
