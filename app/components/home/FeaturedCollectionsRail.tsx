import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {Button} from '~/components/ui/Button';
import {Skeleton} from '~/components/ui/Skeleton';
import {pickCollectionCardImage, useLocalDemoMedia} from '~/lib/demoLocalMedia';
import {cn} from '~/lib/cn';
import {fadeUp, stagger} from '~/lib/motion';

interface FeaturedCollectionsRailProps {
  collections: Promise<{collections?: {nodes: FeaturedCollectionFragment[]}} | null>;
  title?: string;
  eyebrow?: string;
}

/** Grid uses first 8 nodes; rail prefers the next slice so content does not duplicate on large catalogs. */
function pickRailCollectionNodes(nodes: FeaturedCollectionFragment[]) {
  if (nodes.length > 8) return nodes.slice(8, 20);
  return nodes.slice(0, Math.min(12, nodes.length));
}

export function FeaturedCollectionsRail({
  collections,
  title = 'Featured collections',
  eyebrow = 'Shop the drops',
}: FeaturedCollectionsRailProps) {
  return (
    <Section spacing="lg" className="border-t border-[var(--color-neutral-200)] bg-[var(--color-paper)]">
      <Container className="flex flex-col gap-8">
        <ScrollReveal
          variants={stagger(0, 0.05)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <ScrollReveal
              variants={fadeUp}
              as="div"
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]"
            >
              {eyebrow}
            </ScrollReveal>
            <ScrollReveal
              variants={fadeUp}
              as="div"
              className="font-display text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em]"
            >
              {title}
            </ScrollReveal>
          </div>
          <Link
            to="/collections"
            prefetch="intent"
            className="self-start text-sm font-medium underline-offset-4 hover:underline sm:self-auto"
          >
            View all
          </Link>
        </ScrollReveal>

        <Suspense fallback={<RailSkeleton />}>
          <Await resolve={collections}>
            {(response) => {
              const nodes = response?.collections?.nodes ?? [];
              const railNodes = pickRailCollectionNodes(nodes);
              if (!railNodes.length) return null;
              return <RailTrack collections={railNodes} />;
            }}
          </Await>
        </Suspense>
      </Container>
    </Section>
  );
}

const SCROLL_AMOUNT = 400;

function RailTrack({collections}: {collections: FeaturedCollectionFragment[]}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const {scrollLeft, scrollWidth, clientWidth} = el;
    setCanLeft(scrollLeft > 2);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, {passive: true});
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, collections.length]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * SCROLL_AMOUNT,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [reduceMotion]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-16 bg-gradient-to-l from-[var(--color-paper)] to-transparent sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-16 bg-gradient-to-r from-[var(--color-paper)] to-transparent sm:block"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-y-0 right-2 z-[2] hidden items-center sm:flex"
        role="group"
        aria-label="Scroll featured collections"
      >
        <div className="pointer-events-auto flex flex-col gap-1 rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-paper)]/95 p-1 shadow-[var(--shadow-sm)] backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)] disabled:opacity-30"
            disabled={!canLeft}
            aria-label="Scroll left"
            onClick={() => scrollByDir(-1)}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)] disabled:opacity-30"
            disabled={!canRight}
            aria-label="Scroll right"
            onClick={() => scrollByDir(1)}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2 pt-1',
          '-mx-4 scroll-ps-4 scroll-pe-4 md:-mx-8 md:scroll-ps-8 md:scroll-pe-8 lg:-mx-12 lg:scroll-ps-12 lg:scroll-pe-12',
          '[scrollbar-width:thin]',
          '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-neutral-400)]',
        )}
        role="region"
        aria-label="Featured collections"
      >
        {collections.map((collection, i) => (
          <RailCard key={collection.id} collection={collection} index={i} />
        ))}
      </div>
    </div>
  );
}

function RailCard({
  collection,
  index,
}: {
  collection: FeaturedCollectionFragment;
  index: number;
}) {
  const demoLocal = useLocalDemoMedia();
  const imageData = demoLocal
    ? pickCollectionCardImage(collection.handle)
    : collection.image;

  return (
    <Link
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className={cn(
        'group relative shrink-0 snap-start',
        'w-[min(78vw,320px)] sm:w-[min(42vw,380px)] lg:w-[min(32vw,420px)]',
      )}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-200)] ring-1 ring-[var(--color-neutral-200)] transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-within:ring-2 focus-within:ring-[var(--color-ink)]">
        {imageData ? (
          <Image
            data={imageData}
            alt={collection.image?.altText || collection.title}
            aspectRatio="4/5"
            loading={index < 3 ? 'eager' : 'lazy'}
            sizes="(min-width: 1024px) 32vw, (min-width: 640px) 42vw, 78vw"
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-[var(--color-neutral-200)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-[var(--color-floral-white)]">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] md:text-2xl">
            {collection.title}
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85">
            Shop collection
          </span>
        </div>
      </div>
    </Link>
  );
}

function RailSkeleton() {
  return (
    <div className="-mx-4 flex gap-4 overflow-hidden md:-mx-8 lg:-mx-12">
      {['a', 'b', 'c', 'd'].map((key) => (
        <div key={key} className="w-[min(78vw,320px)] shrink-0 sm:w-[min(42vw,380px)]">
          <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-2xl)]" />
        </div>
      ))}
    </div>
  );
}
