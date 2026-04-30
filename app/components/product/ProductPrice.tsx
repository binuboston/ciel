import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {cn} from '~/lib/cn';

interface ProductPriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: ProductPriceProps) {
  if (!price) {
    return <span className={cn('inline-block', className)}>&nbsp;</span>;
  }

  if (compareAtPrice) {
    return (
      <div
        aria-label="Price"
        role="group"
        className={cn('inline-flex items-baseline gap-2', className)}
      >
        <span className="text-[var(--color-danger)]">
          <Money data={price} />
        </span>
        <s className="text-[var(--color-neutral-400)]">
          <Money data={compareAtPrice} />
        </s>
      </div>
    );
  }

  return (
    <span aria-label="Price" className={cn('inline-block', className)}>
      <Money data={price} />
    </span>
  );
}
