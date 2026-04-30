import {ArrowRight} from 'lucide-react';
import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {Button} from '~/components/ui/Button';
import {Logo} from '~/components/ui/Logo';
import {cn} from '~/lib/cn';
import {resolveMenuUrl} from '~/lib/menu';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({footer, header, publicStoreDomain}: FooterProps) {
  const {shop} = header;
  return (
    <Section dark spacing="lg" className="mt-auto">
      <Container className="flex flex-col gap-16">
        <Logo
          decorative
          className="h-16 w-full max-w-[640px] md:h-28 lg:h-36"
        />
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            Built for the
            <br />
            bold.
          </h2>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <FooterColumn title="Shop">
            <FooterLink to="/collections">All collections</FooterLink>
            <FooterLink to="/collections/all">New arrivals</FooterLink>
            <FooterLink to="/search">Search</FooterLink>
          </FooterColumn>
          <FooterColumn title="Help">
            <Suspense>
              <Await resolve={footer}>
                {(resolved) => (
                  <FooterMenu
                    menu={resolved?.menu}
                    primaryDomainUrl={shop.primaryDomain?.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </Await>
            </Suspense>
          </FooterColumn>
          <FooterColumn title="Account">
            <FooterLink to="/account">Sign in</FooterLink>
            <FooterLink to="/account/orders">Orders</FooterLink>
            <FooterLink to="/account/profile">Profile</FooterLink>
          </FooterColumn>
          <FooterColumn title="Connect">
            <FooterLink href="https://www.instagram.com" external>
              Instagram
            </FooterLink>
            <FooterLink href="https://www.tiktok.com" external>
              TikTok
            </FooterLink>
            <FooterLink href="https://www.youtube.com" external>
              YouTube
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--color-neutral-700)] pt-8 text-xs text-[var(--color-neutral-300)] md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {shop.name}. All rights reserved.
          </p>
          <p className="uppercase tracking-[0.2em]">Powered by Hydrogen</p>
        </div>
      </Container>
    </Section>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-neutral-300)]">
        {title}
      </h3>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

interface FooterLinkProps {
  to?: string;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
}

function FooterLink({to, href, external, children}: FooterLinkProps) {
  const className = cn(
    'inline-block py-1 text-[var(--color-neutral-100)] transition-colors hover:text-[var(--color-paper)]',
  );
  if (external && href) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      </li>
    );
  }
  if (to) {
    return (
      <li>
        <NavLink to={to} prefetch="intent" className={className}>
          {children}
        </NavLink>
      </li>
    );
  }
  return null;
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu?: FooterQuery['menu'] | null;
  primaryDomainUrl?: string | null;
  publicStoreDomain: string;
}) {
  const items = menu?.items ?? FALLBACK_FOOTER_MENU.items;
  return (
    <>
      {items.map((item) => {
        if (!item.url) return null;
        const url = resolveMenuUrl({
          url: item.url,
          primaryDomainUrl,
          publicStoreDomain,
        });
        return <FooterLink key={item.id} to={url}>{item.title}</FooterLink>;
      })}
    </>
  );
}

function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-md flex-col gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <label
        htmlFor="newsletter-email"
        className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-neutral-300)]"
      >
        Get on the list
      </label>
      <div className="flex items-center gap-2 rounded-full border border-[var(--color-neutral-700)] bg-transparent px-2 py-2">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@domain.com"
          className="flex-1 bg-transparent px-3 text-sm text-[var(--color-paper)] placeholder:text-[var(--color-neutral-400)] focus:outline-none"
        />
        <Button type="submit" variant="accent" size="sm">
          Subscribe
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Button>
      </div>
      <p className="text-[11px] text-[var(--color-neutral-400)]">
        Drops, behind-the-scenes, and members-only releases.
      </p>
    </form>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
