import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import type {CollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <>
      <Section spacing="md" className="border-b border-[var(--color-neutral-200)]">
        <Container className="flex flex-col gap-4">
          <ScrollReveal className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
              Collections
            </span>
            <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              Explore by drop
            </h1>
            <p className="max-w-2xl text-base text-[var(--color-neutral-600)] md:text-lg">
              Curated edits designed around fit, function, and form.
            </p>
          </ScrollReveal>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <PaginatedResourceSection<CollectionFragment>
            connection={collections}
            resourcesClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {({node: collection, index}) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </Container>
      </Section>
    </>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group flex flex-col gap-4"
    >
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-200)]">
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="4/5"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 1200px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-[4/5] w-full bg-[var(--color-neutral-200)]" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
          {collection.title}
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)] transition-colors group-hover:text-[var(--color-ink)]">
          Shop
        </span>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
