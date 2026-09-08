import React, { useEffect, useRef } from 'react';

interface Props {
  html: string;
  className?: string;
}

/**
 * Renders thread HTML safely for mail bodies.
 * - `cid:` / empty-src images (embedded attachments with no HTTP URL) can never
 *   load, so they are removed outright.
 * - Any other image that fails to load (network, expired signed URL) is removed
 *   on error, instead of showing a broken-image icon or placeholder.
 */
export const SafeHtml: React.FC<Props> = ({ html, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];

    root.querySelectorAll('img').forEach((img) => {
      const src = (img.getAttribute('src') || '').trim();

      const dropImage = () => {
        if (!img.isConnected) return;
        img.remove();
      };

      // Embedded attachment references are not fetchable — drop right away
      if (!src || src.toLowerCase().startsWith('cid:')) {
        dropImage();
        return;
      }

      // Already failed (e.g. cached failure) — drop now
      if (img.complete && img.naturalWidth === 0) {
        dropImage();
        return;
      }

      // Otherwise watch for a future load failure
      const onError = () => dropImage();
      img.addEventListener('error', onError);
      cleanups.push(() => img.removeEventListener('error', onError));
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [html]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
