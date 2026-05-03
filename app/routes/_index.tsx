import {useLoaderData} from 'react-router';
import {parseDemoCollectionHandles} from '~/lib/demoLocalMedia';
import type {Route} from './+types/_index';
import {FeaturedCollection} from '~/components/home/FeaturedCollection';
import {FeaturedCollectionsRail} from '~/components/home/FeaturedCollectionsRail';
import {Hero} from '~/components/home/Hero';
import {MarqueeBar} from '~/components/home/MarqueeBar';
import {RecommendedProducts} from '~/components/home/RecommendedProducts';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Ciel — Built for the bold'},
    {
      name: 'description',
      content:
        'Limited drops, engineered fits, and a relentless point of view. Discover the latest from Ciel.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);
  return {
    featuredCollection: collections.nodes[0] ?? null,
    /**
     * The second-most recent collection drives the editorial banner so the
     * homepage stays meaningful even when a store only has 2 collections.
     */
    secondaryCollection: collections.nodes[1] ?? null,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const filter = parseDemoCollectionHandles(context.env);
  const recommendedCollections = context.storefront
    .query(RECOMMENDED_COLLECTIONS_QUERY)
    .then((res) => {
      if (!res?.collections?.nodes?.length || !filter?.length) return res;
      const nodes = res.collections.nodes.filter((c) => filter.includes(c.handle));
      return {...res, collections: {...res.collections, nodes}};
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  return {recommendedCollections};
}

const HERO_VIDEO_BASE =
  'https://demo-1-9580.myshopify.com/cdn/shop/videos/c/vp/5c8186d6608d45f38e64e409e73a4697/5c8186d6608d45f38e64e409e73a4697';
const HERO_VIDEO_SOURCES = [
  {
    src: `${HERO_VIDEO_BASE}.HD-1080p-3.3Mbps-73883969.mp4?v=0`,
    type: 'video/mp4',
    media: '(min-width: 1024px)',
  },
  {
    src: `${HERO_VIDEO_BASE}.HD-720p-2.1Mbps-73883969.mp4?v=0`,
    type: 'video/mp4',
  },
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Hero
        collection={data.featuredCollection}
        videoSources={HERO_VIDEO_SOURCES}
        heroImageSrc="/products/a165be30ab114e0b5f9d94763bb97d5c.jpg"
      />
      <MarqueeBar />
      <RecommendedProducts products={data.recommendedCollections} />
      <FeaturedCollection collection={data.secondaryCollection ?? data.featuredCollection} />
      <FeaturedCollectionsRail collections={data.recommendedCollections} />
    </>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
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
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 2, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_COLLECTIONS_QUERY = `#graphql
  fragment RecommendedCollection on Collection {
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
  query RecommendedCollections ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 24, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedCollection
      }
    }
  }
` as const;
