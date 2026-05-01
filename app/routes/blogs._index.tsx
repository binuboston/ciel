import {getPaginationVariables} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {BlogsQuery} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {Route} from './+types/blogs._index';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [{title: `Hydrogen | Blogs`}];
};

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
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <>
      <Section spacing="md" className="border-b border-[var(--color-neutral-200)]">
        <Container className="flex flex-col gap-4">
          <ScrollReveal className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
              Journal
            </span>
            <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              Stories and drops
            </h1>
            <p className="max-w-2xl text-base text-[var(--color-neutral-600)] md:text-lg">
              Campaign notes, material deep-dives, and release stories from CIEL.
            </p>
          </ScrollReveal>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <PaginatedResourceSection<BlogNode>
            connection={blogs}
            resourcesClassName="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {({node: blog}) => (
              <Link
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
                className="group rounded-[var(--radius-2xl)] border border-[var(--color-neutral-200)] bg-[var(--color-paper)] p-6 transition-colors hover:border-[var(--color-neutral-400)]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]">
                  Blog
                </span>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em]">
                  {blog.title}
                </h2>
                <p className="mt-3 text-sm text-[var(--color-neutral-500)]">
                  {blog.seo?.description || 'Read the latest stories from this edit.'}
                </p>
                <span className="mt-5 inline-flex text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)] transition-colors group-hover:text-[var(--color-ink)]">
                  Open journal
                </span>
              </Link>
            )}
          </PaginatedResourceSection>
        </Container>
      </Section>
    </>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
