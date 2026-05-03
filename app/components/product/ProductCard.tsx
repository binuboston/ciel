import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Link} from 'react-router';
import {HoverImageSwap} from '~/components/motion/HoverImageSwap';
import {pickProductCardImages, useLocalDemoMedia} from '~/lib/demoLocalMedia';
import {cn} from '~/lib/cn';
import {useVariantUrl} from '~/lib/variants';

type CardImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
} | null;

/**
 * Structural type used by the homepage and PLP. Any product fragment that
 * carries `id`, `handle`, `title`, `featuredImage` and `priceRange` works.
 * Optional `images` and `compareAtPriceRange` enable hover-swap and sale
 * pricing when present.
 */
export interface ProductCardProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: CardImage | undefined;
  images?: {nodes: Array<NonNullable<CardImage>>} | null;
  priceRange: {minVariantPrice: MoneyV2};
  compareAtPriceRange?: {minVariantPrice?: MoneyV2 | null} | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  /** Use eager loading for above-the-fold cards. */
  priority?: boolean;
  /** Tailwind sizes attribute for the image. */
  sizes?: string;
  className?: string;
  /** Optional eyebrow label (e.g. "New", "Best seller"). */
  eyebrow?: string;
}

export function ProductCard({
  product,
  priority,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  className,
  eyebrow,
}: ProductCardProps) {
  const variantUrl = useVariantUrl(product.handle);
  const demoLocal = useLocalDemoMedia();
  const {primary, secondary} = demoLocal
    ? pickProductCardImages(product.handle)
    : {
        primary: product.featuredImage ?? null,
        secondary: product.images?.nodes?.[1] ?? null,
      };

  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice ?? null;
  const onSale =
    compareAtPrice &&
    Number(compareAtPrice.amount) >
      Number(product.priceRange.minVariantPrice.amount);

  return (
    <Link
      to={variantUrl}
      prefetch="intent"
      viewTransition
      aria-label={product.title}
      className={cn('group flex flex-col gap-3', className)}
    >
      <div className="relative">
        {eyebrow ? (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-[var(--color-paper)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
            {eyebrow}
          </span>
        ) : null}
        {onSale ? (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-ink)]">
            Sale
          </span>
        ) : null}
        <HoverImageSwap
          primary={primary}
          secondary={secondary}
          alt={primary?.altText || product.title}
          aspectRatio="4/5"
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="text-sm font-medium leading-tight tracking-tight">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 text-sm">
          {onSale ? (
            <>
              <span className="font-medium text-[var(--color-danger)]">
                <Money data={product.priceRange.minVariantPrice} />
              </span>
              <s className="text-[var(--color-neutral-400)]">
                <Money data={compareAtPrice} />
              </s>
            </>
          ) : (
            <span className="font-medium">
              <Money data={product.priceRange.minVariantPrice} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
