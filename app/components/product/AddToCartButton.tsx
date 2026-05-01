import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {ShoppingBag} from 'lucide-react';
import {type FetcherWithComponents} from 'react-router';
import {Button, type ButtonProps} from '~/components/ui/Button';
import {cn} from '~/lib/cn';

interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  variant = 'primary',
  size = 'lg',
  className,
}: AddToCartButtonProps) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<unknown>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            variant={variant}
            size={size}
            className={cn('w-full min-h-14 [&_svg]:text-inherit', className)}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
            {children}
          </Button>
        </>
      )}
    </CartForm>
  );
}
