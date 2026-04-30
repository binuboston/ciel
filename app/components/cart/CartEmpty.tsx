import {ShoppingBag} from 'lucide-react';
import {Link} from 'react-router';
import {useUIState} from '~/components/layout/UIStateProvider';
import {Button} from '~/components/ui/Button';

export function CartEmpty() {
  const {close} = useUIState();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-neutral-100)]">
        <ShoppingBag className="h-7 w-7 text-[var(--color-neutral-500)]" strokeWidth={1.6} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-semibold tracking-tight">
          Your cart is empty
        </h3>
        <p className="max-w-xs text-sm text-[var(--color-neutral-500)]">
          Discover the latest drops and add a few favourites to your bag.
        </p>
      </div>
      <Button asChild size="md">
        <Link to="/collections" onClick={close} prefetch="viewport">
          Start shopping
        </Link>
      </Button>
    </div>
  );
}
