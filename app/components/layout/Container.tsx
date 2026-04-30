import {forwardRef, type HTMLAttributes} from 'react';
import {cn} from '~/lib/cn';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** When `true`, removes horizontal padding (full-bleed sections inside). */
  bleed?: boolean;
  /** Use a wider max-width for media-heavy hero/grids. */
  size?: 'default' | 'wide' | 'narrow';
}

const sizes = {
  default: 'max-w-[var(--container-max)]',
  wide: 'max-w-[1680px]',
  narrow: 'max-w-3xl',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({className, bleed, size = 'default', ...props}, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizes[size],
          !bleed && 'px-4 md:px-8 lg:px-12',
          className,
        )}
        {...props}
      />
    );
  },
);
