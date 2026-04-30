/**
 * Convert an absolute menu URL coming from the Shopify Storefront API into
 * a path local to this storefront when possible. Keeps real external URLs
 * untouched so that they open in a new tab.
 */
export function resolveMenuUrl({
  url,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  url: string;
  primaryDomainUrl?: string | null;
  publicStoreDomain: string;
}): string {
  if (!url) return url;
  if (
    url.includes('myshopify.com') ||
    (publicStoreDomain && url.includes(publicStoreDomain)) ||
    (primaryDomainUrl && url.includes(primaryDomainUrl))
  ) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url;
}
