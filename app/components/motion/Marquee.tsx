import {Children, cloneElement, isValidElement, type ReactNode} from 'react';
import {cn} from '~/lib/cn';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Inverts the scroll direction. */
  reverse?: boolean;
  /** Pauses the marquee on hover. */
  pauseOnHover?: boolean;
}

/**
 * An infinite horizontal scroller. Uses the CSS keyframes defined in
 * tailwind.css; respects reduced motion via the global media query rule
 * which clamps animations to 1ms.
 */
export function Marquee({
  children,
  className,
  reverse,
  pauseOnHover = true,
}: MarqueeProps) {
  const items = Children.toArray(children);
  const duplicate = items.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {key: `dup-${child.key ?? i}`})
      : child,
  );
  return (
    <div
      className={cn(
        'group relative flex w-full overflow-hidden',
        'mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex shrink-0 animate-marquee items-center gap-12 pr-12',
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
      >
        {items}
        {duplicate}
      </div>
    </div>
  );
}
