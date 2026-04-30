import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm, useOptimisticCart} from '@shopify/hydrogen';
import {data, type HeadersFunction, useLoaderData} from 'react-router';
import {CartEmpty} from '~/components/cart/CartEmpty';
import {
  CartLineItem,
  type CartLine,
  type LineItemChildrenMap,
} from '~/components/cart/CartLineItem';
import {CartSummary} from '~/components/cart/CartSummary';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import type {Route} from './+types/cart';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Cart — Ciel'}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  return await cart.get();
}

function buildChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const map: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(line);
    }
  }
  return map;
}

export default function Cart() {
  const original = useLoaderData<typeof loader>();
  const cart = useOptimisticCart(original);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;
  const childrenMap = buildChildrenMap(lines as CartLine[]);

  return (
    <Section spacing="md">
      <Container>
        <header className="mb-10 flex items-end justify-between gap-6">
          <h1 className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            Your bag
          </h1>
          {hasItems ? (
            <p className="text-sm text-[var(--color-neutral-500)]">
              {cart?.totalQuantity} item
              {cart?.totalQuantity === 1 ? '' : 's'}
            </p>
          ) : null}
        </header>

        {!hasItems ? (
          <div className="rounded-[var(--radius-2xl)] bg-[var(--color-paper-warm)]">
            <CartEmpty />
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            <ul aria-label="Cart items" className="flex flex-col">
              {lines.map((line) => {
                if (
                  'parentRelationship' in line &&
                  line.parentRelationship?.parent
                ) {
                  return null;
                }
                return (
                  <CartLineItem
                    key={line.id}
                    line={line as CartLine}
                    childrenMap={childrenMap}
                  />
                );
              })}
            </ul>
            <CartSummary cart={cart} layout="page" className="lg:sticky lg:top-24" />
          </div>
        )}
      </Container>
    </Section>
  );
}
