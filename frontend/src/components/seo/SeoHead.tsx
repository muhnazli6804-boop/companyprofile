/**
 * SeoHead — mengelola title, meta description, Open Graph, canonical, dan JSON-LD.
 * Sesuai ARCHITECTURE.md bagian 13 dan prompt bagian 10.
 * Memakai React 19 native document head management.
 */
import React from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  siteName?: string;
  /** JSON-LD schema.org EducationalOrganization */
  jsonLd?: Record<string, unknown>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  ogImage,
  canonical,
  siteName = 'Yayasan Padindi',
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </>
  );
};
