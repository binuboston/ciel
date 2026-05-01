import {Slot} from '@radix-ui/react-slot';
import {forwardRef, type ButtonHTMLAttributes} from 'react';
import {cn} from '~/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the child element as the button (used to wrap react-router <Link>). */
  asChild?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wide whitespace-nowrap select-none ' +
  'transition-[transform,background-color,color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] ' +
  'disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-deep-black)] !text-[var(--color-floral-white)] hover:bg-[var(--color-smoky-black)] [&_svg]:text-inherit',
  secondary:
    'bg-[var(--color-neutral-100)] text-[var(--color-ink)] hover:bg-[var(--color-neutral-200)]',
  outline:
    'border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]',
  ghost:
    'text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)]',
  accent:
    'bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:brightness-95',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.75rem] rounded-[var(--radius-pill)]',
  md: 'h-11 px-6 text-[0.8125rem] rounded-[var(--radius-pill)]',
  lg: 'h-14 px-8 text-sm rounded-[var(--radius-pill)]',
  icon: 'h-10 w-10 rounded-full text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {className, variant = 'primary', size = 'md', asChild, ...props},
    ref,
  ) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
