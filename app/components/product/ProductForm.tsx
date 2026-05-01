import {type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {useUIState} from '~/components/layout/UIStateProvider';
import {AddToCartButton} from './AddToCartButton';
import {VariantSelector} from './VariantSelector';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const {open} = useUIState();
  return (
    <div className="flex flex-col gap-8">
      <VariantSelector productOptions={productOptions} />

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        className="!bg-[var(--color-deep-black)] !text-[var(--color-floral-white)] hover:!bg-[var(--color-smoky-black)] [&_svg]:!text-inherit disabled:!opacity-55"
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to bag' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}
