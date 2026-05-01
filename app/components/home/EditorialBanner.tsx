import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
import logoLight from '~/assets/brand/logo-light.svg';
import {Container} from '~/components/layout/Container';
import {Section} from '~/components/layout/Section';
import {ScrollReveal} from '~/components/motion/ScrollReveal';
import {Button} from '~/components/ui/Button';

interface EditorialBannerProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional asset URL (image or video). */
  media?: {url: string; type?: 'image' | 'video'};
}

/**
 * A bold split editorial banner: full-width display heading on the left,
 * a media tile on the right. Falls back to a solid color block if no media is
 * provided so it always reads on screen.
 */
export function EditorialBanner({
  eyebrow = 'Worn by the world',
  title = 'Designed in studio. Worn in motion.',
  body = 'A long-lasting capsule built around two questions: what stays, what evolves. Made with traceable materials and quality-tested across cities.',
  ctaLabel = 'Read the journal',
  ctaHref = '/blogs/journal',
  media,
}: EditorialBannerProps) {
  return (
    <Section spacing="lg">
      <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <ScrollReveal className="flex flex-col gap-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-neutral-500)]">
            {eyebrow}
          </span>
          <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            {title}
          </h2>
          <p className="max-w-prose text-base text-[var(--color-neutral-600)] md:text-lg">
            {body}
          </p>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="self-start bg-[var(--color-deep-black)] text-[var(--color-floral-white)] hover:bg-[var(--color-smoky-black)]"
          >
            <Link to={ctaHref} prefetch="intent">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Button>
        </ScrollReveal>
        <ScrollReveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-900)]">
            {media?.url ? (
              media.type === 'video' ? (
                <video
                  src={media.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]"
                />
              ) : (
                <img
                  src={media.url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-[2px]"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-neutral-700),var(--color-neutral-900)_60%)]" />
            )}
            <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.15)_55%,rgba(0,0,0,0.45)_100%)]" aria-hidden="true" />
            <div className="absolute inset-0 grid place-items-center px-6">
              <img
                src={logoLight}
                alt="CIEL"
                loading="lazy"
                className="w-full max-w-[320px] opacity-90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
