import {ChevronDown} from 'lucide-react';
import {NavLink} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/Popover';
import {cn} from '~/lib/cn';
import {resolveMenuUrl} from '~/lib/menu';
import {FALLBACK_HEADER_MENU} from './Header';

interface MegaMenuProps {
  menu: HeaderQuery['menu'];
  primaryDomainUrl?: string | null;
  publicStoreDomain: string;
}

/**
 * Desktop mega-menu. Renders a flat NavLink for top-level items without
 * children, and a Radix Popover with a column of children for those that do.
 */
export function MegaMenu({menu, primaryDomainUrl, publicStoreDomain}: MegaMenuProps) {
  const items = menu?.items ?? FALLBACK_HEADER_MENU.items;
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="hidden md:flex items-center gap-1"
    >
      {items.map((item) => {
        if (!item.url) return null;
        const url = resolveMenuUrl({
          url: item.url,
          primaryDomainUrl,
          publicStoreDomain,
        });
        const hasChildren = 'items' in item && item.items && item.items.length > 0;

        if (!hasChildren) {
          return (
            <NavLink
              key={item.id}
              to={url}
              prefetch="intent"
              className={({isActive}) =>
                cn(
                  'inline-flex h-10 items-center rounded-full px-4 text-[0.78rem] font-medium uppercase tracking-[0.14em]',
                  'transition-colors hover:bg-current/10',
                  isActive && 'bg-current/10',
                )
              }
            >
              {item.title}
            </NavLink>
          );
        }

        return (
          <Popover key={item.id}>
            <PopoverTrigger
              className={cn(
                'inline-flex h-10 items-center gap-1 rounded-full px-4 text-[0.78rem] font-medium uppercase tracking-[0.14em]',
                'transition-colors hover:bg-current/10',
                'data-[state=open]:bg-current/10',
              )}
            >
              {item.title}
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform duration-[var(--duration-base)] data-[state=open]:rotate-180"
                strokeWidth={2}
              />
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={12} className="min-w-[260px]">
              <ul className="flex flex-col gap-1">
                <li>
                  <NavLink
                    to={url}
                    prefetch="intent"
                    className="block rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium tracking-tight hover:bg-[var(--color-neutral-100)]"
                  >
                    All {item.title}
                  </NavLink>
                </li>
                {item.items!.map((child) => {
                  if (!child.url) return null;
                  const childUrl = resolveMenuUrl({
                    url: child.url,
                    primaryDomainUrl,
                    publicStoreDomain,
                  });
                  return (
                    <li key={child.id}>
                      <NavLink
                        to={childUrl}
                        prefetch="intent"
                        className="block rounded-[var(--radius-md)] px-3 py-2 text-sm tracking-tight text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-ink)]"
                      >
                        {child.title}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>
        );
      })}
    </nav>
  );
}
