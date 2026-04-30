import {forwardRef, type ButtonHTMLAttributes, type ReactNode} from 'react';
import {cn} from '~/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for screen readers since icon buttons have no text content. */
  label: string;
  children: ReactNode;
  badge?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({label, badge, className, children, ...props}, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-full',
          // Inherit text color from the surrounding context (e.g. white on the
          // transparent header over the hero, ink elsewhere) so the icon is
          // never invisible against its backdrop.
          'text-current transition-colors duration-[var(--duration-base)]',
          'hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
          className,
        )}
        {...props}
      >
        {children}
        {badge !== undefined && badge !== null && badge !== 0 ? (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1',
              'inline-flex items-center justify-center rounded-full',
              'bg-[var(--color-accent)] text-[var(--color-accent-ink)]',
              'text-[10px] font-semibold leading-none',
            )}
          >
            {badge}
          </span>
        ) : null}
      </button>
    );
  },
);
