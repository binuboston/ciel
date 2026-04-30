import {Pagination} from '@shopify/hydrogen';
import * as React from 'react';
import {Button} from '~/components/ui/Button';
import {cn} from '~/lib/cn';

/**
 * Cursor-based "Load more / Load previous" pagination wrapper used by PLP and
 * blog routes. The trigger buttons are rendered with the design-system Button
 * primitive so they stay visually consistent across the storefront.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink, hasPreviousPage, hasNextPage}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="flex flex-col gap-12">
            {hasPreviousPage ? (
              <div className="flex justify-center">
                <Button asChild variant="outline" size="md">
                  <PreviousLink>
                    {isLoading ? 'Loading…' : 'Load previous'}
                  </PreviousLink>
                </Button>
              </div>
            ) : null}

            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={cn(resourcesClassName)}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            {hasNextPage ? (
              <div className="flex justify-center">
                <Button asChild variant="outline" size="md">
                  <NextLink>{isLoading ? 'Loading…' : 'Load more'}</NextLink>
                </Button>
              </div>
            ) : null}
          </div>
        );
      }}
    </Pagination>
  );
}
