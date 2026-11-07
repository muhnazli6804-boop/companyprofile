import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from './Modal';

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Buka</button>
      <Modal
        isOpen={open}
        title="Judul Dialog"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <input aria-label="Isian" />
        <button>Batal</button>
        <button>Simpan</button>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('tidak dirender saat tertutup', () => {
    render(
      <Modal isOpen={false} title="X" onClose={() => {}}>
        isi
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dialog modal bernama dari judulnya', () => {
    render(
      <Modal isOpen title="Hapus akun?" onClose={() => {}}>
        isi
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Hapus akun?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('fokus pindah ke dalam dialog saat dibuka', async () => {
    render(<Harness />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Buka' }));
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('Esc menutup dan fokus kembali ke pemicu', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Buka' });
    await user.click(trigger);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('Tab terjebak di dalam dialog (maju dan mundur)', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Buka' }));
    const dialog = screen.getByRole('dialog');

    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 8; i++) {
      await user.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('klik di latar tidak menutup (keputusan tak dapat dibatalkan)', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="X" onClose={onClose}>
        isi
      </Modal>,
    );
    await userEvent.setup().click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).not.toHaveBeenCalled();
  });
});
