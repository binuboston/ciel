import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {Route} from './+types/blogs.$blogHandle._index';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.blog.title ?? ''} blog`}];
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <>
      <Section spacing="md" className="border-b border-[var(--color-neutral-200)]">
        <Container className="flex flex-col gap-4">
          <ScrollReveal className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
              {blog.handle}
            </span>
            <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              {blog.title}
            </h1>
          </ScrollReveal>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <PaginatedResourceSection<ArticleItemFragment>
            connection={articles}
            resourcesClassName="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {({node: article, index}) => (
              <ArticleItem
                article={article}
                key={article.id}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </PaginatedResourceSection>
        </Container>
      </Section>
    </>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group block rounded-[var(--radius-2xl)] border border-[var(--color-neutral-200)] bg-[var(--color-paper)] p-4 transition-colors hover:border-[var(--color-neutral-400)]"
    >
      {article.image ? (
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-neutral-100)]">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <div className="mt-4 flex flex-col gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)]">
          {publishedAt}
        </span>
        <h2 className="font-display text-[clamp(1.4rem,2.2vw,2rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          {article.title}
        </h2>
        <p className="line-clamp-3 text-sm text-[var(--color-neutral-600)]">
          {toPlainText(article.contentHtml)}
        </p>
        <span className="inline-flex text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-neutral-500)] transition-colors group-hover:text-[var(--color-ink)]">
          Read story
        </span>
      </div>
    </Link>
  );
}

function toPlainText(html: string | null | undefined) {
  if (!html) return 'Read the full story.';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
