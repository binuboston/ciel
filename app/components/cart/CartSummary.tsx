import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {ArrowRight} from 'lucide-react';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Button} from '~/components/ui/Button';
import {cn} from '~/lib/cn';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout?: 'page' | 'aside';
  className?: string;
};

export function CartSummary({cart, layout = 'aside', className}: CartSummaryProps) {
  const summaryId = useId();
  const discountId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div
      aria-labelledby={summaryId}
      className={cn(
        'flex flex-col gap-4',
        layout === 'page' && 'rounded-[var(--radius-xl)] bg-[var(--color-paper-warm)] p-6',
        className,
      )}
    >
      <h4
        id={summaryId}
        className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral-500)]"
      >
        Order summary
      </h4>

      <dl className="flex items-baseline justify-between gap-4 text-sm">
        <dt className="text-[var(--color-neutral-500)]">Subtotal</dt>
        <dd className="font-display text-lg font-semibold tabular-nums">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '—'
          )}
        </dd>
      </dl>

      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountInputId={discountId}
      />

      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />

      <p className="text-[11px] text-[var(--color-neutral-500)]">
        Taxes and shipping calculated at checkout.
      </p>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;
  return (
    <Button asChild size="lg" className="w-full">
      <a href={checkoutUrl} target="_self" rel="noreferrer">
        Checkout
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </a>
    </Button>
  );
}

function CartDiscounts({
  discountCodes,
  discountInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="flex flex-col gap-2">
      {codes.length ? (
        <UpdateDiscountForm>
          <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] px-3 py-2 text-xs">
            <span className="font-medium uppercase tracking-wide">
              {codes.join(', ')}
            </span>
            <button
              type="submit"
              className="text-xs text-[var(--color-neutral-500)] underline-offset-2 hover:underline"
              aria-label="Remove discount"
            >
              Remove
            </button>
          </div>
        </UpdateDiscountForm>
      ) : null}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex items-center gap-2">
          <label htmlFor={discountInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="h-10 flex-1 rounded-[var(--radius-pill)] border border-[var(--color-neutral-200)] bg-transparent px-4 text-sm placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-ink)] focus:outline-none"
          />
          <Button type="submit" variant="outline" size="sm">
            Apply
          </Button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data && giftCardCodeInput.current) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];
    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;
      if (focusButton) focusButton.focus();
      else if (giftCardCodeInput.current) giftCardCodeInput.current.focus();
      setRemovedCardIndex(null);
    }
    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const hasCards = !!giftCardCodes && giftCardCodes.length > 0;

  return (
    <section aria-label="Gift cards" className="flex flex-col gap-2">
      {hasCards ? (
        <ul aria-labelledby={giftCardHeadingId} className="flex flex-col gap-2">
          {giftCardCodes!.map((giftCard) => (
            <li
              key={giftCard.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] px-3 py-2 text-xs"
            >
              <span className="font-medium uppercase tracking-wide">
                ***{giftCard.lastCharacters} · <Money data={giftCard.amountUsed} />
              </span>
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.GiftCardCodesRemove}
                inputs={{giftCardCodes: [giftCard.id]}}
              >
                <button
                  type="submit"
                  aria-label={`Remove gift card ending in ${giftCard.lastCharacters}`}
                  ref={(el: HTMLButtonElement | null) => {
                    if (el) removeButtonRefs.current.set(giftCard.id, el);
                    else removeButtonRefs.current.delete(giftCard.id);
                  }}
                  onClick={() => {
                    const idx = previousCardIdsRef.current.indexOf(giftCard.id);
                    if (idx !== -1) setRemovedCardIndex(idx);
                  }}
                  className="text-[var(--color-neutral-500)] underline-offset-2 hover:underline"
                >
                  Remove
                </button>
              </CartForm>
            </li>
          ))}
        </ul>
      ) : null}

      <CartForm
        fetcherKey="gift-card-add"
        route="/cart"
        action={CartForm.ACTIONS.GiftCardCodesAdd}
      >
        <div className="flex items-center gap-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            ref={giftCardCodeInput}
            placeholder="Gift card code"
            className="h-10 flex-1 rounded-[var(--radius-pill)] border border-[var(--color-neutral-200)] bg-transparent px-4 text-sm placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-ink)] focus:outline-none"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={giftCardAddFetcher.state !== 'idle'}
          >
            Apply
          </Button>
        </div>
      </CartForm>
    </section>
  );
}
