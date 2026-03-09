
import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
}

/**
 * Hook that updates document meta information (title, description, canonical link, Open Graph, Twitter cards, etc.).
 *
 * @param options - Meta information to apply to the page.
 */
export function usePageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
}: PageMetaOptions) {
  useEffect(() => {
    // Update the document title
    document.title = title;

    /**
     * Upserts a <meta> element.
     *
     * @param selector - CSS selector to find the existing element.
     * @param attr      - Attribute definition in the form `attrName="attrValue"`.
     * @param value     - The value for the `content` attribute.
     */
    const setMeta = (selector: string, attr: string, value: string) => {
      try {
        let el = document.querySelector<HTMLMetaElement>(selector);
        if (!el) {
          el = document.createElement('meta');
          // Parse the attribute definition (e.g., name="description")
          const [attrName, attrValue] = attr.split('=');
          if (attrName && attrValue) {
            el.setAttribute(
              attrName,
              attrValue.replace(/^["']|["']$/g, '') // strip surrounding quotes
            );
          } else {
            // Fallback: if parsing fails, just set the selector as attribute
            el.setAttribute('name', selector);
          }
          document.head.appendChild(el);
        }
        el.setAttribute('content', value);
      } catch (e) {
        console.error('Failed to set meta tag', selector, e);
      }
    };

    /**
     * Upserts a <link> element.
     *
     * @param rel  - The relationship attribute (e.g., "canonical").
     * @param href - The URL to set.
     */
    const setLink = (rel: string, href: string) => {
      try {
        let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('rel', rel);
          document.head.appendChild(el);
        }
        el.setAttribute('href', href);
      } catch (e) {
        console.error('Failed to set link tag', rel, e);
      }
    };

    // Standard meta tags
    setMeta('meta[name="description"]', 'name="description"', description);
    setLink('canonical', canonical);

    // Open Graph meta tags
    setMeta('meta[property="og:title"]', 'property="og:title"', ogTitle ?? title);
    setMeta('meta[property="og:description"]', 'property="og:description"', ogDescription ?? description);
    setMeta('meta[property="og:url"]', 'property="og:url"', canonical);

    // Twitter Card meta tags
    setMeta('meta[name="twitter:title"]', 'name="twitter:title"', ogTitle ?? title);
    setMeta('meta[name="twitter:description"]', 'name="twitter:description"', ogDescription ?? description);

    // Last-modified meta tag (create if missing)
    let lm = document.querySelector<HTMLMetaElement>('meta[name="last-modified"]');
    if (!lm) {
      lm = document.createElement('meta');
      lm.setAttribute('name', 'last-modified');
      document.head.appendChild(lm);
    }
    lm.setAttribute('content', new Date().toISOString().split('T')[0]);
  }, [title, description, canonical, ogTitle, ogDescription]);
}
