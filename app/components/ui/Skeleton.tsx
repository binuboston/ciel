import {cn} from '~/lib/cn';

export function Skeleton({className}: {className?: string}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-neutral-100)]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
        className,
      )}
    />
  );
}
