import {Image} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';
import {cn} from '~/lib/cn';

type Media = NonNullable<ProductFragment['selectedOrFirstAvailableVariant']>['image'];

interface ProductGalleryProps {
  images: Media[];
  /** Title for alt text fallback. */
  title: string;
}

/**
 * Vertical scroll gallery on desktop, horizontal scroll-snap on mobile.
 * Active state in the dot indicator is driven by IntersectionObserver so the
 * UI stays in sync with native scroll without JS-driven animation.
 */
export function ProductGallery({images, title}: ProductGalleryProps) {
  const cleanImages = images.filter(Boolean) as NonNullable<Media>[];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-gallery-item]'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = items.indexOf(visible.target as HTMLElement);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      {root: container, threshold: [0.4, 0.6, 0.8]},
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cleanImages.length]);

  if (!cleanImages.length) {
    return <div className="aspect-square w-full rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)]" />;
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          'flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory',
          'md:flex-col md:overflow-visible md:snap-none',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {cleanImages.map((image, idx) => (
          <div
            key={image.id ?? `${image.url}-${idx}`}
            data-gallery-item
            className={cn(
              'relative shrink-0 snap-start basis-full md:basis-auto',
              'aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)]',
            )}
          >
            <Image
              data={image}
              alt={image.altText || title}
              aspectRatio="4/5"
              sizes="(min-width: 1024px) 50vw, 100vw"
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      {cleanImages.length > 1 ? (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 md:hidden">
          <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md">
            {cleanImages.map((image, i) => (
              <span
                key={image.id ?? `dot-${image.url}`}
                aria-hidden
                className={cn(
                  'h-1.5 rounded-full bg-white transition-all duration-[var(--duration-base)]',
                  i === activeIndex ? 'w-4 opacity-100' : 'w-1.5 opacity-50',
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
