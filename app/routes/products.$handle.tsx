import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Truck, Undo2} from 'lucide-react';
import {useLoaderData} from 'react-router';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {ProductForm} from '~/components/product/ProductForm';
import {ProductGallery} from '~/components/product/ProductGallery';
import {ProductPrice} from '~/components/product/ProductPrice';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/Accordion';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {Route} from './+types/products.$handle';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.product?.title ?? '';
  return [
    {title: title ? `${title} — Ciel` : 'Product — Ciel'},
    {rel: 'canonical', href: `/products/${data?.product?.handle ?? ''}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

function loadDeferredData(_: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor} = product;

  // Build a gallery: prefer the full images list, but always lead with the
  // selected variant's image so changing color/size visibly reflects up top.
  const galleryImages = (() => {
    const all = product.images?.nodes ?? [];
    const selected = selectedVariant?.image;
    if (!selected) return all;
    const filtered = all.filter((img: {id?: string | null}) => img && img.id !== selected.id);
    return [selected, ...filtered];
  })();

  return (
    <>
      <Section spacing="md">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
            <ProductGallery images={galleryImages} title={title} />

            <ScrollReveal
              as="div"
              className="md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto"
            >
              <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-3">
                  {vendor ? (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
                      {vendor}
                    </span>
                  ) : null}
                  <h1 className="font-display text-[clamp(1.875rem,3.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                    {title}
                  </h1>
                  <div className="text-lg font-medium tabular-nums">
                    <ProductPrice
                      price={selectedVariant?.price}
                      compareAtPrice={selectedVariant?.compareAtPrice}
                    />
                  </div>
                </header>

                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />

                <ul className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-paper-warm)] p-5 text-sm">
                  <li className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-[var(--color-neutral-500)]" strokeWidth={1.6} />
                    Free worldwide shipping over $150
                  </li>
                  <li className="flex items-center gap-3">
                    <Undo2 className="h-4 w-4 text-[var(--color-neutral-500)]" strokeWidth={1.6} />
                    60-day free returns
                  </li>
                </ul>

                <Accordion type="single" collapsible defaultValue="description">
                  <AccordionItem value="description">
                    <AccordionTrigger>Description</AccordionTrigger>
                    <AccordionContent>
                      <div
                        className="prose prose-sm max-w-none text-[var(--color-neutral-600)]"
                        dangerouslySetInnerHTML={{__html: descriptionHtml}}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="materials">
                    <AccordionTrigger>Materials & care</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Crafted from responsibly-sourced materials. Wash cold,
                        line dry, iron on low. Avoid bleach and dry cleaning to
                        preserve the finish.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping">
                    <AccordionTrigger>Shipping & returns</AccordionTrigger>
                    <AccordionContent>
                      <p>
                        Free standard shipping on orders over $150. Express and
                        next-day delivery available at checkout. 60-day free
                        returns — no questions asked.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
