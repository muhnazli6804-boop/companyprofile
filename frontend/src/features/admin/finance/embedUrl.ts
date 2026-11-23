const HOSTS = ['lookerstudio.google.com', 'datastudio.google.com'];

export const EMBED_URL_ERROR =
  'URL embed tidak valid. Gunakan URL https dari lookerstudio.google.com atau datastudio.google.com dengan path /embed/reporting/.';

export type EmbedUrlResult = { url: string } | { error: string };

// Menerima URL polos atau tag <iframe>; hanya nilai src yang diambil, HTML tidak pernah dirender.
export const parseEmbedUrl = (input: string): EmbedUrlResult => {
  const raw = input.trim();
  const src = /<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i.exec(raw)?.[1];

  let u: URL;
  try {
    u = new URL((src ?? raw).trim());
  } catch {
    return { error: EMBED_URL_ERROR };
  }

  const ok =
    u.protocol === 'https:' &&
    HOSTS.includes(u.hostname) &&
    !u.username &&
    !u.port &&
    u.pathname.startsWith('/embed/reporting/');

  return ok ? { url: u.href } : { error: EMBED_URL_ERROR };
};
