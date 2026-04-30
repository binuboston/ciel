import {useOptimisticCart} from '@shopify/hydrogen';
import {Menu, Search, ShoppingBag, User} from 'lucide-react';
import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {useUIState} from '~/components/layout/UIStateProvider';
import {IconButton} from '~/components/ui/IconButton';
import {Logo} from '~/components/ui/Logo';
import {cn} from '~/lib/cn';
import {resolveMenuUrl} from '~/lib/menu';
import {MegaMenu} from './MegaMenu';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({header, cart, isLoggedIn, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header;
  const scrolled = useScrolled(8);
  const {pathname} = useLocation();
  const isHome = pathname === '/';

  return (
    <header
      data-scrolled={scrolled}
      data-home={isHome}
      className={cn(
        'sticky top-0 z-40 w-full transition-[background,box-shadow,height,color]',
        'duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
        scrolled
          ? 'h-[var(--header-height-compact)] surface-glass shadow-[0_1px_0_var(--color-neutral-100)]'
          : 'h-[var(--header-height)] bg-[var(--color-paper)]',
        !scrolled && isHome && 'bg-transparent text-[var(--color-paper)]',
      )}
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <NavLink
          to="/"
          prefetch="intent"
          end
          aria-label={shop.name}
          className="inline-flex items-center"
        >
          <Logo
            decorative
            className="h-5 w-auto md:h-6 transition-[height] duration-[var(--duration-base)]"
          />
        </NavLink>

        <MegaMenu
          menu={menu}
          primaryDomainUrl={shop.primaryDomain?.url}
          publicStoreDomain={publicStoreDomain}
        />

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </Container>
    </header>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open} = useUIState();
  return (
    <nav className="flex items-center gap-1" aria-label="Account, search, and cart">
      <IconButton
        label="Open menu"
        onClick={() => open('menu')}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} />
      </IconButton>
      <IconButton label="Open search" onClick={() => open('search')}>
        <Search className="h-5 w-5" strokeWidth={1.8} />
      </IconButton>
      <Suspense
        fallback={
          <IconButton label="Sign in" onClick={() => undefined} disabled>
            <User className="h-5 w-5" strokeWidth={1.8} />
          </IconButton>
        }
      >
        <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
          {() => <AccountIcon />}
        </Await>
      </Suspense>
      <CartToggle cart={cart} />
    </nav>
  );
}

function AccountIcon() {
  return (
    <NavLink
      to="/account"
      prefetch="intent"
      aria-label="Account"
      className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-current/10"
    >
      <User className="h-5 w-5" strokeWidth={1.8} />
    </NavLink>
  );
}

function CartToggle({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {open} = useUIState();
  return (
    <Suspense
      fallback={
        <IconButton label="Cart" onClick={() => open('cart')}>
          <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
        </IconButton>
      }
    >
      <Await resolve={cart}>
        <CartBadge />
      </Await>
    </Suspense>
  );
}

function CartBadge() {
  const original = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(original);
  const {open} = useUIState();
  const count = cart?.totalQuantity ?? 0;
  return (
    <IconButton
      label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      onClick={() => open('cart')}
      badge={count > 0 ? count : undefined}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
    </IconButton>
  );
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return scrolled;
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: HeaderQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  const items = menu?.items ?? FALLBACK_HEADER_MENU.items;
  const {close} = useUIState();
  return (
    <nav role="navigation" className="flex flex-col gap-2">
      <NavLink
        to="/"
        prefetch="intent"
        end
        onClick={close}
        className="border-b border-[var(--color-neutral-100)] py-3 font-display text-lg font-semibold tracking-tight"
      >
        Home
      </NavLink>
      {items.map((item) => {
        if (!item.url) return null;
        const url = resolveMenuUrl({
          url: item.url,
          primaryDomainUrl,
          publicStoreDomain,
        });
        return (
          <NavLink
            key={item.id}
            to={url}
            prefetch="intent"
            onClick={close}
            className="border-b border-[var(--color-neutral-100)] py-3 font-display text-lg font-semibold tracking-tight transition-colors hover:text-[var(--color-neutral-500)]"
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

export const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Shop',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Journal',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};
