import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {redirect, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/product/ProductCard';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {Route} from './+types/collections.$handle';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: data?.collection?.title ? `${data.collection.title} — Ciel` : 'Collection — Ciel'},
  ];
};

const SORT_OPTIONS = [
  {value: 'manual', label: 'Featured'},
  {value: 'best-selling', label: 'Best selling'},
  {value: 'price-asc', label: 'Price: Low to High'},
  {value: 'price-desc', label: 'Price: High to Low'},
  {value: 'created-desc', label: 'New arrivals'},
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

const SORT_KEY_MAP: Record<SortValue, {sortKey: string; reverse: boolean}> = {
  manual: {sortKey: 'MANUAL', reverse: false},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
  'created-desc': {sortKey: 'CREATED', reverse: true},
};

function parseSort(value: string | null): SortValue {
  return (SORT_OPTIONS.find((o) => o.value === value)?.value ?? 'manual') as SortValue;
}

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const sort = parseSort(url.searchParams.get('sort'));
  const {sortKey, reverse} = SORT_KEY_MAP[sort];
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, sortKey, reverse, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, sort};
}

function loadDeferredData(_: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection, sort} = useLoaderData<typeof loader>();

  return (
    <>
      <Section
        spacing="md"
        className="border-b border-[var(--color-neutral-200)] bg-[var(--color-paper)]"
      >
        <Container className="flex flex-col gap-6">
          <ScrollReveal className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
              Collection
            </span>
            <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="max-w-2xl text-base text-[var(--color-neutral-500)] md:text-lg">
                {collection.description}
              </p>
            ) : null}
          </ScrollReveal>
        </Container>
      </Section>

      <Section spacing="md" className="bg-[var(--color-paper)]">
        <Container className="flex flex-col gap-8">
          <CollectionToolbar
            sort={sort}
            count={collection.products.nodes.length}
          />

          <PaginatedResourceSection<ProductItemFragment>
            connection={collection.products}
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

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </>
  );
}

function CollectionToolbar({sort, count}: {sort: SortValue; count: number}) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return (
    <div className="sticky top-[var(--header-height-compact)] z-20 -mx-4 flex items-center justify-between gap-4 rounded-[var(--radius-pill)] border border-[var(--color-neutral-200)] bg-[color-mix(in_srgb,var(--color-paper)_85%,transparent)] px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-neutral-500)]">
        {count} item{count === 1 ? '' : 's'}
      </p>
      <label className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-neutral-500)]">
        Sort
        <select
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            if (e.target.value === 'manual') next.delete('sort');
            else next.set('sort', e.target.value);
            void navigate(`?${next.toString()}`, {preventScrollReset: true});
          }}
          className="h-9 rounded-full border border-[var(--color-neutral-200)] bg-transparent px-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink)] focus:border-[var(--color-ink)] focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
