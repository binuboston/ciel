import {Image} from '@shopify/hydrogen';
import {type ComponentProps} from 'react';
import {cn} from '~/lib/cn';

type ImageData = ComponentProps<typeof Image>['data'];

interface HoverImageSwapProps {
  primary?: ImageData | null;
  secondary?: ImageData | null;
  alt: string;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  aspectRatio?: string;
  className?: string;
}

/**
 * A media tile that crossfades from a primary image to a secondary image on
 * hover (e.g. front/back product shots). Falls back to a single image when no
 * secondary image is available. Pure CSS — no JS required.
 */
export function HoverImageSwap({
  primary,
  secondary,
  alt,
  sizes,
  loading,
  aspectRatio = '4/5',
  className,
}: HoverImageSwapProps) {
  return (
    <div
      className={cn(
        'group/img relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)]',
        className,
      )}
      style={{aspectRatio}}
    >
      {primary ? (
        <Image
          data={primary as NonNullable<ImageData>}
          alt={alt}
          aspectRatio={aspectRatio}
          sizes={sizes}
          loading={loading}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-[transform,opacity]',
            'duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]',
            secondary
              ? 'group-hover/img:opacity-0 group-hover/img:scale-[1.02]'
              : 'group-hover/img:scale-[1.03]',
          )}
        />
      ) : null}
      {secondary ? (
        <Image
          data={secondary as NonNullable<ImageData>}
          alt=""
          aspectRatio={aspectRatio}
          sizes={sizes}
          loading="lazy"
          className={cn(
            'absolute inset-0 h-full w-full object-cover opacity-0',
            'transition-[transform,opacity] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]',
            'group-hover/img:opacity-100 group-hover/img:scale-[1.03]',
          )}
        />
      ) : null}
    </div>
  );
}
