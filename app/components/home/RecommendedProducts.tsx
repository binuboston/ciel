import {ArrowUpRight} from 'lucide-react';
import {Suspense} from 'react';
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
  title = 'Just dropped',
  eyebrow = 'Latest releases',
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
                <ScrollReveal
                  variants={stagger(0.05, 0.07)}
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {response.collections.nodes.slice(0, 8).map((collection, i) => (
                    <ScrollReveal
                      key={collection.id}
                      variants={fadeUp}
                      as="div"
                    >
                      <CollectionCard collection={collection} priority={i < 4} />
                    </ScrollReveal>
                  ))}
                </ScrollReveal>
              ) : null
            }
          </Await>
        </Suspense>
      </Container>
    </Section>
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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {['s1', 's2', 's3', 's4'].map((key) => (
        <div key={key} className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
