import {ArrowLeft, ArrowRight, ArrowUpRight} from 'lucide-react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {Skeleton} from '~/components/ui/Skeleton';
import {fadeUp, stagger} from '~/lib/motion';

interface RecommendedProductsProps {
  products: Promise<{collections?: {nodes: FeaturedCollectionFragment[]}} | null>;
  title?: string;
  eyebrow?: string;
}

export function RecommendedProducts({
  products,
  title = 'Featured collections',
  eyebrow = 'Editorial picks',
}: RecommendedProductsProps) {
  return (
    <Section spacing="lg">
      <Container className="flex flex-col gap-10">
        <ScrollReveal
          variants={stagger(0, 0.05)}
          className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
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
              className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em]"
            >
              {title}
            </ScrollReveal>
          </div>
          <Link
            to="/collections"
            prefetch="intent"
            className="group inline-flex items-center gap-2 self-start text-sm font-medium underline-offset-4 hover:underline md:self-auto"
          >
            See everything
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={2}
            />
          </Link>
        </ScrollReveal>

        <Suspense fallback={<ProductsGridSkeleton />}>
          <Await resolve={products}>
            {(response) =>
              response?.collections?.nodes ? (
                <CollectionsRail collections={response.collections.nodes} />
              ) : null
            }
          </Await>
        </Suspense>
      </Container>
    </Section>
  );
}

function CollectionsRail({collections}: {collections: FeaturedCollectionFragment[]}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const {scrollLeft, clientWidth, scrollWidth} = rail;
    const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0);
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateScrollState();
    rail.addEventListener('scroll', updateScrollState, {passive: true});
    window.addEventListener('resize', updateScrollState);
    return () => {
      rail.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [collections.length, updateScrollState]);

  const scrollByDirection = useCallback((direction: 'prev' | 'next') => {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(Math.round(rail.clientWidth * 0.85), 320);
    rail.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="hidden justify-end gap-2 sm:flex">
        <button
          type="button"
          aria-label="Scroll featured collections left"
          onClick={() => scrollByDirection('prev')}
          disabled={!canScrollPrev}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-neutral-300)] bg-[var(--color-paper)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll featured collections right"
          onClick={() => scrollByDirection('next')}
          disabled={!canScrollNext}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-neutral-300)] bg-[var(--color-paper)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <ScrollReveal variants={stagger(0.05, 0.07)} as="div">
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {collections.map((collection, i) => (
            <ScrollReveal
              key={collection.id}
              variants={fadeUp}
              as="div"
              className="shrink-0 snap-start basis-[82%] sm:basis-[48%] lg:basis-[32%] xl:basis-[28%]"
            >
              <CollectionCard collection={collection} priority={i < 4} />
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function CollectionCard({
  collection,
  priority,
}: {
  collection: FeaturedCollectionFragment;
  priority?: boolean;
}) {
  return (
    <Link to={`/collections/${collection.handle}`} prefetch="intent" className="group flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-200)]">
        {collection.image ? (
          <Image
            data={collection.image}
            alt={collection.image.altText || collection.title}
            aspectRatio="4/5"
            loading={priority ? 'eager' : 'lazy'}
            sizes="(min-width: 1200px) 25vw, (min-width: 768px) 40vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-[var(--color-neutral-200)]" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">
          {collection.title}
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)] transition-colors group-hover:text-[var(--color-ink)]">
          Explore
        </span>
      </div>
    </Link>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden">
      {['s1', 's2', 's3', 's4'].map((key) => (
        <div
          key={key}
          className="min-w-0 shrink-0 basis-[82%] sm:basis-[48%] lg:basis-[32%] xl:basis-[28%]"
        >
          <div className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
