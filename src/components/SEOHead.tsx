import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // Update Document Title
    const fullTitle = title.includes('Top10') ? title : `${title} — Top10`;
    document.title = fullTitle;

    // Update Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // Update Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) ogTypeMeta.setAttribute('content', ogType);

    if (canonicalUrl) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
    }

    // JSON-LD Structured Data
    const existingScript = document.getElementById('json-ld-script');
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'json-ld-script';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const oldScript = document.getElementById('json-ld-script');
      if (oldScript) oldScript.remove();
    };
  }, [title, description, canonicalUrl, ogType, jsonLd]);

  return null;
};
