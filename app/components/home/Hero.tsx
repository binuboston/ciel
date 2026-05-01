import {Image} from '@shopify/hydrogen';
import {ArrowDown, ArrowUpRight} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/layout/Container';
import {Button} from '~/components/ui/Button';
import {cn} from '~/lib/cn';

export interface HeroVideoSource {
  src: string;
  type?: string;
  media?: string;
}

interface HeroProps {
  collection?: FeaturedCollectionFragment | null;
  videoSources?: HeroVideoSource[];
  videoPoster?: string;
}

/**
 * Full-bleed hero: optional cinematic video + collection image fallback.
 * Pulled up behind the transparent home header (flush top, no paper gap).
 */
export function Hero({collection, videoSources, videoPoster}: HeroProps) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const image = collection?.image;
  const hasVideo = !!videoSources?.length;
  const showVideo = hasVideo && !reduceMotion;
  const posterFallback = videoPoster || image?.url;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
    } else {
      void v.play().catch(() => {});
    }
  }, [reduceMotion]);

  return (
    <section
      className={cn(
        'surface-dark relative isolate overflow-hidden',
        'flex items-end',
        '[margin-top:calc(var(--header-height)*-1)]',
        '[min-height:calc(100svh+var(--header-height))]',
      )}
    >
      {showVideo ? (
        <motion.video
          ref={videoRef}
          initial={{scale: 1.06}}
          animate={{scale: 1}}
          transition={{duration: 18, ease: 'easeOut'}}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterFallback}
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          style={{filter: 'contrast(1.06) saturate(0.9)'}}
        >
          {videoSources?.map((s) => (
            <source
              key={s.src}
              src={s.src}
              type={s.type ?? 'video/mp4'}
              media={s.media}
            />
          ))}
        </motion.video>
      ) : image ? (
        <Image
          data={image}
          alt={image.altText || collection?.title || 'Hero'}
          sizes="100vw"
          loading="eager"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[var(--color-paper)]" />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[5] bg-gradient-to-b from-black/45 via-black/55 to-black/90"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(to_right,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.35)_45%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(0,0,0,0.55)_100%)]"
      />

      <Container className="relative z-10 flex flex-col gap-8 pb-16 md:pb-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">
          {collection?.title ? `Now drop · ${collection.title}` : 'Now dropping'}
        </p>
        <h1 className="font-display font-bold text-[var(--text-display)] leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
          Wear the
          <br />
          future.
        </h1>
        <p className="max-w-xl text-base text-white/95 md:text-lg [text-shadow:0_1px_18px_rgba(0,0,0,0.65)]">
          Limited drops, engineered fits, and a relentless point of view.
          Built for people who refuse to fit in.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="accent"
            size="lg"
            className="shadow-[0_10px_40px_-10px_rgba(162,138,104,0.55)]"
          >
            <Link
              to={
                collection?.handle
                  ? `/collections/${collection.handle}`
                  : '/collections'
              }
              prefetch="intent"
              viewTransition
            >
              Shop the drop
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/70 bg-white/10 text-white backdrop-blur-md hover:bg-[var(--color-floral-white)] hover:text-[var(--color-deep-black)]"
          >
            <Link to="/collections" prefetch="intent">
              Browse all
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Scroll to content"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight * 0.92,
              behavior: 'smooth',
            });
          }}
          className="mt-6 inline-flex items-center gap-2 self-start text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85 transition-colors hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
        >
          Scroll
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={2.5} />
        </button>
      </Container>
    </section>
  );
}
