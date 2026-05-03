import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {CartDrawer} from '~/components/cart/CartDrawer';
import {Footer} from '~/components/footer/Footer';
import {Header} from '~/components/header/Header';
import {MobileMenuDrawer} from '~/components/header/MobileMenuDrawer';
import {SearchDrawer} from '~/components/header/SearchDrawer';
import {
  HeaderLayoutProvider,
  HeaderSpacer,
} from '~/components/layout/HeaderLayoutContext';
import {UIStateProvider} from './UIStateProvider';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <UIStateProvider>
      <HeaderLayoutProvider>
        <div className="flex min-h-svh flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
          {header ? (
            <Header
              header={header}
              cart={cart}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
            />
          ) : null}

          {header ? <HeaderSpacer /> : null}

          <main className="flex-1">{children}</main>

          <Footer
            footer={footer}
            header={header}
            publicStoreDomain={publicStoreDomain}
          />

          {/* Global drawers */}
          <CartDrawer cart={cart} />
          <MobileMenuDrawer header={header} publicStoreDomain={publicStoreDomain} />
          <SearchDrawer />
        </div>
      </HeaderLayoutProvider>
    </UIStateProvider>
  );
}
