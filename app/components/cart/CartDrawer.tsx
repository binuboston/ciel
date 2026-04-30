import {useOptimisticCart} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {Await} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useUIState} from '~/components/layout/UIStateProvider';
import {Skeleton} from '~/components/ui/Skeleton';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/components/ui/Drawer';
import {CartEmpty} from './CartEmpty';
import {
  CartLineItem,
  type CartLine,
  type LineItemChildrenMap,
} from './CartLineItem';
import {CartSummary} from './CartSummary';

interface CartDrawerProps {
  cart: Promise<CartApiQueryFragment | null>;
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

export function CartDrawer({cart}: CartDrawerProps) {
  const {drawer, close} = useUIState();
  const open = drawer === 'cart';

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DrawerContent side="right" className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle className="uppercase tracking-[0.2em] text-xs">
            Your bag
          </DrawerTitle>
        </DrawerHeader>
        <Suspense fallback={<CartLoading />}>
          <Await resolve={cart}>
            {(resolvedCart) => <CartDrawerContents cart={resolvedCart} />}
          </Await>
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}

function CartDrawerContents({cart: original}: {cart: CartApiQueryFragment | null}) {
  const cart = useOptimisticCart(original);
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;

  if (!hasItems) {
    return (
      <DrawerBody className="!p-0">
        <CartEmpty />
      </DrawerBody>
    );
  }

  const childrenMap = buildChildrenMap(lines as CartLine[]);

  return (
    <>
      <DrawerBody className="!py-0">
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
      </DrawerBody>
      <DrawerFooter>
        <CartSummary cart={cart} layout="aside" />
      </DrawerFooter>
    </>
  );
}

function CartLoading() {
  return (
    <DrawerBody>
      <div className="flex flex-col gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-24 w-20" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full max-w-[140px]" />
            </div>
          </div>
        ))}
      </div>
    </DrawerBody>
  );
}
