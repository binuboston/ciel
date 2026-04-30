import * as Dialog from '@radix-ui/react-dialog';
import {X} from 'lucide-react';
import {forwardRef, type ComponentPropsWithoutRef, type ReactNode} from 'react';
import {cn} from '~/lib/cn';

/**
 * A side drawer (slide-in panel) built on Radix Dialog. Used for the cart,
 * mobile nav, and predictive search. Handles focus trap, ESC, and scroll
 * lock automatically.
 */

type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const sideStyles: Record<DrawerSide, string> = {
  right:
    'inset-y-0 right-0 h-full w-full max-w-md ' +
    'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
    'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  left:
    'inset-y-0 left-0 h-full w-full max-w-md ' +
    'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
    'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  top:
    'inset-x-0 top-0 max-h-[90vh] w-full ' +
    'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
    'data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  bottom:
    'inset-x-0 bottom-0 max-h-[90vh] w-full ' +
    'data-[state=open]:animate-in data-[state=closed]:animate-out ' +
    'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
};

export const Drawer = Dialog.Root;
export const DrawerTrigger = Dialog.Trigger;
export const DrawerClose = Dialog.Close;
export const DrawerPortal = Dialog.Portal;

export const DrawerOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(function DrawerOverlay({className, ...props}, ref) {
  return (
    <Dialog.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  );
});

interface DrawerContentProps
  extends ComponentPropsWithoutRef<typeof Dialog.Content> {
  side?: DrawerSide;
  hideClose?: boolean;
  closeLabel?: string;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent(
    {className, children, side = 'right', hideClose, closeLabel = 'Close', ...props},
    ref,
  ) {
    return (
      <DrawerPortal>
        <DrawerOverlay />
        <Dialog.Content
          ref={ref}
          className={cn(
            'fixed z-50 flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]',
            'shadow-[var(--shadow-pop)] outline-none',
            'duration-[var(--duration-base)]',
            sideStyles[side],
            className,
          )}
          {...props}
        >
          {children}
          {!hideClose ? (
            <Dialog.Close
              aria-label={closeLabel}
              className={cn(
                'absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full',
                'text-[var(--color-ink)] transition-colors hover:bg-[var(--color-neutral-100)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]',
              )}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          ) : null}
        </Dialog.Content>
      </DrawerPortal>
    );
  },
);

export function DrawerHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-[var(--color-neutral-100)] px-6 py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DrawerTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Title
      className={cn(
        'font-display text-lg font-semibold tracking-tight',
        className,
      )}
    >
      {children}
    </Dialog.Title>
  );
}

export function DrawerDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Description
      className={cn('text-sm text-[var(--color-neutral-500)]', className)}
    >
      {children}
    </Dialog.Description>
  );
}

export function DrawerBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-6 py-5', className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-t border-[var(--color-neutral-100)] px-6 py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
