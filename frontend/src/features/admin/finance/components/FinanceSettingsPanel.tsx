import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Save } from "lucide-react";
import { updateFinanceDashboard, type FinanceConfig } from "../api";
import { parseEmbedUrl } from "../embedUrl";

// Dirender hanya bila API mengirim `config` (Super Admin); backend tetap menolak penulis lain dengan 403.
export const FinanceSettingsPanel: React.FC<{ config: FinanceConfig }> = ({ config }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(config);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: updateFinanceDashboard,
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["admin-finance-dashboard"] });
    },
    onError: (err) =>
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Gagal menyimpan pengaturan.",
      ),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    let url = "";
    if (form.url.trim() !== "") {
      const parsed = parseEmbedUrl(form.url);
      if ("error" in parsed) {
        setError(parsed.error);
        return;
      }
      url = parsed.url;
    }
    setError(null);
    setForm({ ...form, url });
    mutation.mutate({ ...form, url });
  };

  return (
    <form onSubmit={handleSave} className="bg-white border border-border rounded-xl p-5 space-y-4 text-sm">
      <div>
        <h3 className="font-bold text-navy">Pengaturan Dashboard (Super Admin)</h3>
        <p className="text-xs text-muted">Tempel URL embed Looker Studio atau seluruh tag iframe; hanya src yang diambil.</p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
        />
        <span className="font-semibold">Aktifkan dashboard keuangan</span>
      </label>

      <div>
        <label htmlFor="finance-title" className="block font-semibold mb-1">Judul Halaman</label>
        <input
          id="finance-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="finance-url" className="block font-semibold mb-1">URL Embed Looker Studio</label>
        <textarea
          id="finance-url"
          rows={2}
          placeholder="https://lookerstudio.google.com/embed/reporting/..."
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          aria-invalid={error ? true : undefined}
          className="w-full px-3 py-2 border border-border rounded-lg font-mono text-xs"
        />
        {error && <p role="alert" className="text-danger font-semibold mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg font-semibold disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {mutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
        {saved && (
          <span role="status" className="inline-flex items-center gap-1 text-leaf font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Tersimpan
          </span>
        )}
      </div>
    </form>
  );
};
