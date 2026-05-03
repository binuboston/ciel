import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {Minus, Plus, Trash2} from 'lucide-react';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useUIState} from '~/components/layout/UIStateProvider';
import {ProductPrice} from '~/components/product/ProductPrice';
import {
  pickPoolPath,
  toSyntheticStorefrontImage,
  useLocalDemoMedia,
} from '~/lib/demoLocalMedia';
import {cn} from '~/lib/cn';
import {useVariantUrl} from '~/lib/variants';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

interface CartLineItemProps {
  line: CartLine;
  childrenMap?: LineItemChildrenMap;
  /** Renders nested children indented (used internally for recursion). */
  nested?: boolean;
}

export function CartLineItem({line, childrenMap, nested}: CartLineItemProps) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const demoLocal = useLocalDemoMedia();
  const resolvedImage = demoLocal
    ? toSyntheticStorefrontImage(pickPoolPath(product.handle, 0), `cart-${line.id}`, title)
    : image;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useUIState();
  const lineItemChildren = childrenMap?.[id];

  return (
    <li
      className={cn(
        'flex gap-4 py-5',
        !nested && 'border-b border-[var(--color-neutral-100)] last:border-b-0',
      )}
    >
      {resolvedImage ? (
        <Link
          to={lineItemUrl}
          onClick={close}
          prefetch="intent"
          className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-neutral-100)]"
        >
          <Image
            data={resolvedImage}
            alt={title}
            aspectRatio="4/5"
            sizes="80px"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={lineItemUrl}
            onClick={close}
            prefetch="intent"
            className="text-sm font-medium leading-snug hover:underline"
          >
            {product.title}
          </Link>
          <div className="text-right text-sm font-medium tabular-nums">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
        </div>

        {selectedOptions.length ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            {selectedOptions
              .filter((o) => o.value && o.value !== 'Default Title')
              .map((o) => `${o.name}: ${o.value}`)
              .join(' · ')}
          </p>
        ) : null}

        <CartLineQuantity line={line} />
      </div>

      {lineItemChildren?.length ? (
        <ul className="ml-6 mt-3 border-l border-[var(--color-neutral-100)] pl-4">
          {lineItemChildren.map((child) => (
            <CartLineItem key={child.id} line={child} childrenMap={childrenMap} nested />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Math.max(0, quantity - 1);
  const nextQuantity = quantity + 1;

  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <div className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-neutral-200)]">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            className="grid h-8 w-8 place-items-center rounded-l-[var(--radius-pill)] transition-colors hover:bg-[var(--color-neutral-100)] disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </CartLineUpdateButton>
        <span className="min-w-[2ch] px-2 text-center text-xs font-medium tabular-nums">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            disabled={!!isOptimistic}
            className="grid h-8 w-8 place-items-center rounded-r-[var(--radius-pill)] transition-colors hover:bg-[var(--color-neutral-100)] disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        type="submit"
        aria-label="Remove item"
        disabled={disabled}
        className="inline-flex items-center gap-1 text-xs text-[var(--color-neutral-500)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-30"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((l) => l.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
