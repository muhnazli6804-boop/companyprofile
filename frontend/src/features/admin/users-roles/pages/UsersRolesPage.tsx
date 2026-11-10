import React, { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { UsersTab } from '../components/UsersTab';
import { RolesTab } from '../components/RolesTab';

const TABS = [
  { key: 'pengguna', label: 'Pengguna' },
  { key: 'role', label: 'Role & Permission' },
] as const;

export const UsersRolesPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') === 'role' ? 'role' : 'pengguna';
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (key: string) => setParams(key === 'pengguna' ? {} : { tab: key }, { replace: true });

  // Pola tab WAI-ARIA: panah kiri/kanan memindah tab, hanya tab aktif yang masuk urutan Tab.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = TABS[(TABS.findIndex((t) => t.key === active) + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    select(next.key);
    tabRefs.current[next.key]?.focus();
  };

  return (
    <div>
      <SeoHead title="Pengguna & Role" />
      <h1 className="text-2xl font-display font-bold text-primary mb-4">Pengguna & Role</h1>

      <div role="tablist" aria-label="Bagian halaman" onKeyDown={onKeyDown} className="flex gap-1 border-b border-line mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[t.key] = el;
            }}
            id={`tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            aria-controls={`panel-${t.key}`}
            tabIndex={active === t.key ? 0 : -1}
            onClick={() => select(t.key)}
            className={
              'min-h-[44px] px-4 font-bold whitespace-nowrap border-b-4 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
              (active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
        {active === 'pengguna' ? <UsersTab /> : <RolesTab />}
      </div>
    </div>
  );
};
export default UsersRolesPage;
