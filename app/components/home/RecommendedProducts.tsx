import {ArrowUpRight} from 'lucide-react';
import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {ProductCard} from '~/components/product/ProductCard';
import {Skeleton} from '~/components/ui/Skeleton';
import {fadeUp, stagger} from '~/lib/motion';

interface RecommendedProductsProps {
  products: Promise<RecommendedProductsQuery | null>;
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
              response?.products?.nodes ? (
                <ScrollReveal
                  variants={stagger(0.05, 0.07)}
                  className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
                >
                  {response.products.nodes.map((product, i) => (
                    <ScrollReveal
                      key={product.id}
                      variants={fadeUp}
                      as="div"
                    >
                      <ProductCard product={product} priority={i < 4} />
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

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
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
