import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ShieldCheck, Users, Award } from 'lucide-react';

interface OrgMember {
  id: number;
  name: string;
  position: string;
  bio?: string | null;
  photo_path?: string | null;
  sort_order: number;
}

interface StaffRole {
  name: string;
  label: string;
}

interface StaffMember {
  id: number;
  name: string;
  roles: StaffRole[];
}

const ROLE_COLOR: Record<string, string> = {
  guru: 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200',
  staff: 'bg-sky-100 text-sky-800 font-semibold border border-sky-200',
  admin_registration: 'bg-amber-100 text-amber-900 font-semibold border border-amber-200',
  admin_content: 'bg-indigo-100 text-indigo-900 font-semibold border border-indigo-200',
};

function RoleBadge({ role }: { role: StaffRole }) {
  const cls = ROLE_COLOR[role.name] ?? 'bg-tint-100 text-ink';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold leading-tight ${cls}`}>
      {role.label}
    </span>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div
      aria-hidden="true"
      className="w-12 h-12 rounded-full bg-navy/10 border-2 border-navy/20 flex items-center justify-center font-display font-bold text-navy shrink-0 text-base shadow-2xs"
    >
      {initials || 'Y'}
    </div>
  );
}

export const OrganizationSection: React.FC = () => {
  const { data: orgMembers, isLoading: orgLoading } = useQuery<OrgMember[]>({
    queryKey: ['public', 'organization'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: OrgMember[] }>('/public/organization');
        return res.data.data;
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const { data: staffMembers, isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ['public', 'staff'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: StaffMember[] }>('/public/staff');
        return res.data.data;
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Hanya ambil staf dan guru (superadmin dikecualikan dari tampilan)
  const filteredStaff = React.useMemo(() => {
    if (!staffMembers) return [];
    return staffMembers
      .filter((s) => !s.roles.some((r) => r.name === 'super_admin'))
      .map((s) => ({
        ...s,
        roles: s.roles.filter((r) => r.name !== 'super_admin'),
      }))
      .filter((s) => s.roles.length > 0);
  }, [staffMembers]);

  const hasOrg = Boolean(orgMembers && orgMembers.length > 0);
  const hasStaff = Boolean(filteredStaff.length > 0);

  // Jika belum ada data sama sekali dan sudah selesai loading, jangan tampilkan section kosong
  if (!orgLoading && !staffLoading && !hasOrg && !hasStaff) {
    return null;
  }

  return (
    <section
      id="pengurus"
      aria-labelledby="pengurus-heading"
      className="bg-paper py-16 md:py-24 border-t border-line"
      style={{ scrollMarginTop: '4rem' }}
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-16">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3.5 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Struktur &amp; Tim Pengelola
          </span>
          <h2
            id="pengurus-heading"
            className="font-display font-bold text-3xl md:text-4xl text-navy"
          >
            Dewan Pengurus &amp; Tim Staf Yayasan
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Mengenal jajaran pembina, pengurus harian, serta tim profesional yang mengawal tata kelola dan dedikasi pendidikan di Yayasan Padindi.
          </p>
        </div>

        {/* 1. Dewan Pembina & Pengurus Yayasan (dari CMS) */}
        {hasOrg && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
              <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <Award className="w-5 h-5 text-star" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy">
                  Struktur Dewan Pembina &amp; Pengurus
                </h3>
                <p className="text-xs text-muted">
                  Jajaran pemegang amanah dan pimpinan tertinggi yayasan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {orgMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-card border border-navy/10 p-6 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-navy/10 border-2 border-star shrink-0 relative">
                      {member.photo_path ? (
                        <img
                          src={member.photo_path}
                          alt={member.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold text-navy text-lg">
                          {member.name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-base text-navy leading-snug">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-primary mt-1">
                        {member.position}
                      </p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-muted leading-relaxed mt-4 pt-4 border-t border-navy/5 line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Tim Staf & Guru Berole (hanya staf dan guru, superadmin dikecualikan) */}
        {hasStaff && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
              <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <ShieldCheck className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-navy">
                  Tim Staf &amp; Guru Yayasan
                </h3>
                <p className="text-xs text-muted">
                  Tenaga pendidik, guru pengajar, serta staf kependidikan dan operasional yayasan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white p-4 rounded-lg border border-navy/10 flex items-center gap-3.5 shadow-2xs hover:border-navy/30 transition-colors"
                >
                  <InitialAvatar name={staff.name} />
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <p className="font-display font-bold text-sm text-navy leading-tight truncate">
                      {staff.name}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {staff.roles.map((r) => (
                        <RoleBadge key={r.name} role={r} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

