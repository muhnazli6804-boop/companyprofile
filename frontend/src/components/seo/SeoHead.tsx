import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
}

// TODO: see Struktur-Folder-Padindi.md section 3 & SEO Best Practices
export const SeoHead: React.FC<SeoHeadProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = title + ' | Yayasan Padindi';
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
};
