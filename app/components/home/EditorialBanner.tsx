import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
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
          <Button asChild variant="primary" size="lg" className="self-start">
            <Link to={ctaHref} prefetch="intent">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Button>
        </ScrollReveal>
        <ScrollReveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-neutral-100)]">
            {media?.url ? (
              media.type === 'video' ? (
                <video
                  src={media.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={media.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-[clamp(3rem,12vw,8rem)] font-black tracking-[-0.04em] text-[var(--color-neutral-200)]">
                  CIEL
                </span>
              </div>
            )}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
