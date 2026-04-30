import {getPaginationVariables} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/product/ProductCard';
import type {Route} from './+types/collections.all';

export const meta: Route.MetaFunction = () => {
  return [{title: 'All products — Ciel'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {variables: {...paginationVariables}}),
  ]);
  return {products};
}

function loadDeferredData(_: Route.LoaderArgs) {
  return {};
}

export default function Catalog() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <>
      <Section spacing="md" className="border-b border-[var(--color-neutral-100)]">
        <Container className="flex flex-col gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
            Catalog
          </span>
          <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            Everything
          </h1>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <PaginatedResourceSection<CollectionItemFragment>
            connection={products}
            resourcesClassName="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
          >
            {({node: product, index}) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            )}
          </PaginatedResourceSection>
        </Container>
      </Section>
    </>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
