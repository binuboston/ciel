import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com',
    label: 'Instagram',
    Icon: InstagramIcon,
  },
  {
    href: 'https://www.youtube.com',
    label: 'YouTube',
    Icon: YouTubeIcon,
  },
  {
    href: 'https://www.facebook.com',
    label: 'Facebook',
    Icon: FacebookIcon,
  },
];

export function Footer({header}: FooterProps) {
  return (
    <Section spacing="none" className="mt-auto bg-[var(--color-floral-white)]">
      <Container className="flex flex-col gap-3 py-3 text-[var(--color-ink)] md:flex-row md:items-center md:justify-between">
        <p className="text-[11px] text-[var(--color-ink-soft)]">
          © {new Date().getFullYear()} CIEL. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5">
          {SOCIAL_LINKS.map(({href, label, Icon}) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-neutral-300)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bone)] hover:text-[var(--color-deep-black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-floral-white)]"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function InstagramIcon({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M20.8 8.2a2.8 2.8 0 0 0-2-2C17.2 5.7 12 5.7 12 5.7s-5.2 0-6.8.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.7 12c0 1.3.1 2.6.5 3.8a2.8 2.8 0 0 0 2 2c1.6.5 6.8.5 6.8.5s5.2 0 6.8-.5a2.8 2.8 0 0 0 2-2c.4-1.2.5-2.5.5-3.8 0-1.3-.1-2.6-.5-3.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M10.3 9.6 15 12l-4.7 2.4V9.6Z" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M13.6 19v-5h1.7l.3-2h-2V10.7c0-.6.2-1.1 1.1-1.1h1V7.9a13 13 0 0 0-1.5-.1c-1.5 0-2.6.9-2.6 2.7V12H9.9v2h1.7v5h2Z"
        fill="currentColor"
      />
    </svg>
  );
}
