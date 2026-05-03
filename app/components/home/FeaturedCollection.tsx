import {Image} from '@shopify/hydrogen';
import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {pickCollectionCardImage, useLocalDemoMedia} from '~/lib/demoLocalMedia';

interface FeaturedCollectionProps {
  collection: FeaturedCollectionFragment | null | undefined;
  eyebrow?: string;
}

export function FeaturedCollection({
  collection,
  eyebrow = 'Featured collection',
}: FeaturedCollectionProps) {
  const demoLocal = useLocalDemoMedia();
  if (!collection) return null;
  const image = demoLocal
    ? pickCollectionCardImage(collection.handle)
    : collection.image;

  return (
    <Section spacing="lg">
      <Container>
        <ScrollReveal>
          <Link
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            viewTransition
            className="group block overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-100)]"
          >
            <div className="relative aspect-[16/10] w-full md:aspect-[21/9]">
              {image ? (
                <Image
                  data={image}
                  alt={image.altText || collection.title}
                  sizes="100vw"
                  loading="lazy"
                  className="h-full w-full scale-100 object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:p-12 text-[var(--color-paper)]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-paper)]/80">
                  {eyebrow}
                </span>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <h2 className="font-display text-[clamp(2rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
                    {collection.title}
                  </h2>
                  <span className="inline-flex items-center gap-2 self-end rounded-full bg-[var(--color-paper)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] transition-transform group-hover:translate-x-1">
                    Shop now
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
