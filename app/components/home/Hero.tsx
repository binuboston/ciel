import {Image} from '@shopify/hydrogen';
import {ArrowDown, ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Button} from '~/components/ui/Button';
import {cn} from '~/lib/cn';

interface HeroProps {
  collection?: FeaturedCollectionFragment | null;
}

/**
 * Full-bleed hero. Uses the featured collection's image as the backdrop and
 * falls back to a bold solid color block with display type so the page never
 * collapses if a store has no media yet. Above-the-fold image is loaded eagerly.
 */
export function Hero({collection}: HeroProps) {
  const image = collection?.image;
  return (
    <section
      className={cn(
        'surface-dark relative isolate overflow-hidden',
        'min-h-[88svh] flex items-end',
      )}
    >
      {image ? (
        <Image
          data={image}
          alt={image.altText || collection?.title || 'Hero'}
          sizes="100vw"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[var(--color-ink)]" />
      )}
      <div className="absolute inset-0 -z-[5] bg-gradient-to-b from-black/10 via-black/30 to-black/70" />

      <Container className="relative z-10 flex flex-col gap-8 pb-16 md:pb-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-paper)]/70">
          {collection?.title ? `Now drop · ${collection.title}` : 'Now dropping'}
        </p>
        <h1 className="font-display font-bold text-[var(--text-display)] leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)] text-[var(--color-paper)]">
          Wear the
          <br />
          future.
        </h1>
        <p className="max-w-xl text-base text-[var(--color-paper)]/85 md:text-lg">
          Limited drops, engineered fits, and a relentless point of view.
          Built for people who refuse to fit in.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button asChild variant="accent" size="lg">
            <Link
              to={
                collection?.handle
                  ? `/collections/${collection.handle}`
                  : '/collections'
              }
              prefetch="intent"
              viewTransition
            >
              Shop the drop
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]">
            <Link to="/collections" prefetch="intent">
              Browse all
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Scroll to content"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight * 0.92,
              behavior: 'smooth',
            });
          }}
          className="mt-6 inline-flex items-center gap-2 self-start text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-paper)]/70 transition-colors hover:text-[var(--color-paper)]"
        >
          Scroll
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={2.5} />
        </button>
      </Container>
    </section>
  );
}
