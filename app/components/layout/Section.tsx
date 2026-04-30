import {forwardRef, type HTMLAttributes} from 'react';
import {cn} from '~/lib/cn';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Apply a dark surface (inverts ink/paper tokens). */
  dark?: boolean;
  /** Vertical rhythm preset. */
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

const spacings = {
  none: '',
  sm: 'py-10 md:py-14',
  md: 'py-16 md:py-24',
  lg: 'py-24 md:py-32',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section(
    {className, dark, spacing = 'md', children, ...props},
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          spacings[spacing],
          dark && 'surface-dark',
          className,
        )}
        {...props}
      >
        {children}
      </section>
    );
  },
);
