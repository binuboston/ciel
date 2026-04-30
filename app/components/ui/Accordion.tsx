import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {ChevronDown} from 'lucide-react';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import {cn} from '~/lib/cn';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({className, ...props}, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn('border-b border-[var(--color-neutral-100)]', className)}
      {...props}
    />
  );
});

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({className, children, ...props}, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-left',
          'font-display text-sm font-semibold uppercase tracking-wide',
          'transition-colors hover:text-[var(--color-neutral-500)]',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-[var(--duration-base)]"
          strokeWidth={2}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({className, children, ...props}, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        'overflow-hidden text-sm text-[var(--color-neutral-600)]',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      )}
      {...props}
    >
      <div className={cn('pb-5 pt-0 leading-relaxed', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
