import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {Link, useNavigate} from 'react-router';
import {cn} from '~/lib/cn';

type Option = MappedProductOptions;
type OptionValue = Option['optionValues'][number];

interface VariantSelectorProps {
  productOptions: MappedProductOptions[];
}

/**
 * Renders product variant options. Detects whether the option looks like a
 * color/finish (swatch) or a size/scalar (pill) and renders an appropriate
 * UI. Selecting a value updates the URL search params optimistically without
 * full navigation, mirroring the Hydrogen useOptimisticVariant pattern.
 */
export function VariantSelector({productOptions}: VariantSelectorProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        const isSwatchOption = option.optionValues.some(
          (v) => v.swatch?.color || v.swatch?.image?.previewImage?.url,
        );
        const selectedLabel = option.optionValues.find((v) => v.selected)?.name;

        return (
          <div key={option.name} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-display font-semibold uppercase tracking-[0.18em]">
                {option.name}
              </span>
              {selectedLabel ? (
                <span className="text-[var(--color-neutral-500)]">
                  {selectedLabel}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
                {option.optionValues.map((value) => {
                  const handleSelect = (uri: string) => {
                    void navigate(`?${uri}`, {
                      replace: true,
                      preventScrollReset: true,
                    });
                  };
                  return isSwatchOption ? (
                    <SwatchOption
                      key={option.name + value.name}
                      option={option}
                      value={value}
                      onSelect={handleSelect}
                    />
                  ) : (
                    <ScalarOption
                      key={option.name + value.name}
                      option={option}
                      value={value}
                      onSelect={handleSelect}
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScalarOption({
  option: _option,
  value,
  onSelect,
}: {
  option: Option;
  value: OptionValue;
  onSelect: (uri: string) => void;
}) {
  const {
    name,
    handle,
    variantUriQuery,
    selected,
    available,
    exists,
    isDifferentProduct,
  } = value;

  const className = cn(
    'inline-flex h-10 min-w-[3rem] items-center justify-center rounded-full px-4',
    'text-sm font-medium transition-[colors,transform] duration-[var(--duration-base)]',
    selected
      ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
      : 'bg-transparent text-[var(--color-ink)] ring-1 ring-[var(--color-neutral-200)] hover:ring-[var(--color-ink)]',
    !available && 'line-through opacity-40',
    !exists && !isDifferentProduct && 'pointer-events-none opacity-30',
  );

  if (isDifferentProduct) {
    return (
      <Link
        to={`/products/${handle}?${variantUriQuery}`}
        prefetch="intent"
        replace
        preventScrollReset
        className={className}
      >
        {name}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (!selected) onSelect(variantUriQuery);
      }}
      disabled={!exists}
      aria-pressed={selected}
      className={className}
    >
      {name}
    </button>
  );
}

function SwatchOption({
  option: _option,
  value,
  onSelect,
}: {
  option: Option;
  value: OptionValue;
  onSelect: (uri: string) => void;
}) {
  const {
    name,
    handle,
    variantUriQuery,
    selected,
    available,
    exists,
    isDifferentProduct,
    swatch,
  } = value;

  const className = cn(
    'group relative inline-flex h-10 w-10 items-center justify-center rounded-full',
    'transition-[transform] duration-[var(--duration-base)]',
    'before:absolute before:inset-0 before:rounded-full before:transition-[box-shadow] before:duration-[var(--duration-base)]',
    selected
      ? 'before:shadow-[0_0_0_2px_var(--color-ink)]'
      : 'before:shadow-[0_0_0_1px_var(--color-neutral-200)] hover:before:shadow-[0_0_0_2px_var(--color-ink)]',
    !available && 'opacity-40 after:absolute after:inset-0 after:m-auto after:h-px after:w-7 after:rotate-45 after:bg-current',
    !exists && !isDifferentProduct && 'pointer-events-none opacity-30',
  );

  const inner = <SwatchVisual swatch={swatch} name={name} />;

  if (isDifferentProduct) {
    return (
      <Link
        to={`/products/${handle}?${variantUriQuery}`}
        prefetch="intent"
        replace
        preventScrollReset
        aria-label={name}
        className={className}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={name}
      aria-pressed={selected}
      disabled={!exists}
      onClick={() => {
        if (!selected) onSelect(variantUriQuery);
      }}
      className={className}
    >
      {inner}
    </button>
  );
}

function SwatchVisual({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch>;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;
  if (!image && !color) {
    return (
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-neutral-100)] text-[10px] font-medium uppercase">
        {name.slice(0, 2)}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="block h-7 w-7 overflow-hidden rounded-full"
      style={{backgroundColor: color || 'transparent'}}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}
