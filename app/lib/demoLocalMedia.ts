import {useRouteLoaderData} from 'react-router';

/**
 * Ordered list of demo photos under `public/products/`.
 * Update when you add or remove files (Workers cannot scan `public/` at runtime).
 */
export const DEMO_LOCAL_PRODUCT_IMAGE_PATHS = [
  '/products/05e035b913f9f17db50cb8b27603e185.jpg',
  '/products/263df5dfae9b48ddfd67038efa67e43a.jpg',
  '/products/3b2d2b241d8a9f27d970cacda25976a0.jpg',
  '/products/3c892831c46e169b3468fc36b4bf5e68.jpg',
  '/products/4e23183c2ab345e1e2be9f33c9dc2567.jpg',
  '/products/58d404ff26022905413bdd1bd6a17f53.jpg',
  '/products/5b116e99b0025817c178aecc219ed4e8.jpg',
  '/products/877401835a30a91dc3acbe289178f4c6.jpg',
  '/products/87c1ebaa964fb644c74fda68010666bc.jpg',
  '/products/a165be30ab114e0b5f9d94763bb97d5c.jpg',
  '/products/aa469ba64db862d31a67a6a37e879a08.jpg',
  '/products/b980d0caeba663d53bd75e3b181146f4.jpg',
  '/products/e24944b44e8880a8b0e4e4750b874692.jpg',
] as const;

const POOL_LEN = DEMO_LOCAL_PRODUCT_IMAGE_PATHS.length;
const DEFAULT_DIM = {width: 1600, height: 2000} as const;

export type SyntheticStorefrontImage = {
  __typename?: 'Image';
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export function isLocalDemoMediaEnabled(
  env: {PUBLIC_USE_LOCAL_DEMO_MEDIA?: string} | undefined,
): boolean {
  const v = env?.PUBLIC_USE_LOCAL_DEMO_MEDIA?.toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes';
}

/** Comma-separated collection handles; empty / unset = no filter. */
export function parseDemoCollectionHandles(
  env: {PUBLIC_DEMO_COLLECTION_HANDLES?: string} | undefined,
): string[] | null {
  const raw = env?.PUBLIC_DEMO_COLLECTION_HANDLES?.trim();
  if (!raw) return null;
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : null;
}

function hashHandle(handle: string): number {
  let h = 0;
  for (let i = 0; i < handle.length; i++) {
    h = (Math.imul(31, h) + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function toSyntheticStorefrontImage(
  path: string,
  idSuffix: string,
  altText = '',
): SyntheticStorefrontImage {
  return {
    __typename: 'Image',
    id: `gid://local/DemoImage/${idSuffix}`,
    url: path,
    altText,
    width: DEFAULT_DIM.width,
    height: DEFAULT_DIM.height,
  };
}

export function pickPoolPath(handle: string, offset = 0): string {
  const start = hashHandle(handle) % POOL_LEN;
  return DEMO_LOCAL_PRODUCT_IMAGE_PATHS[(start + offset) % POOL_LEN]!;
}

export function pickGallerySyntheticImages(
  handle: string,
  count: number,
): SyntheticStorefrontImage[] {
  const n = Math.max(1, Math.min(count, POOL_LEN));
  const out: SyntheticStorefrontImage[] = [];
  for (let i = 0; i < n; i++) {
    const path = pickPoolPath(handle, i);
    out.push(toSyntheticStorefrontImage(path, `${handle}-gallery-${i}`, handle));
  }
  return out;
}

export function pickProductCardImages(handle: string): {
  primary: SyntheticStorefrontImage;
  secondary: SyntheticStorefrontImage;
} {
  return {
    primary: toSyntheticStorefrontImage(pickPoolPath(handle, 0), `${handle}-card-0`, handle),
    secondary: toSyntheticStorefrontImage(pickPoolPath(handle, 1), `${handle}-card-1`, handle),
  };
}

export function pickCollectionCardImage(handle: string): SyntheticStorefrontImage {
  return toSyntheticStorefrontImage(
    pickPoolPath(`collection:${handle}`, 0),
    `collection-${handle}`,
    handle,
  );
}

export function pickArticleCardImage(handle: string): SyntheticStorefrontImage {
  return toSyntheticStorefrontImage(
    pickPoolPath(`article:${handle}`, 2),
    `article-${handle}`,
    handle,
  );
}

export function firstDemoImageUrl(): string {
  return DEMO_LOCAL_PRODUCT_IMAGE_PATHS[0]!;
}

export function useLocalDemoMedia(): boolean {
  const data = useRouteLoaderData('root') as {useLocalDemoMedia?: boolean} | undefined;
  return Boolean(data?.useLocalDemoMedia);
}
