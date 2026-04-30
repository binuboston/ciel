import {Search} from 'lucide-react';
import {useId} from 'react';
import {Link} from 'react-router';
import {useUIState} from '~/components/layout/UIStateProvider';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '~/components/ui/Drawer';

/**
 * Predictive search drawer. Slides in from the top and renders results
 * inline as the user types, using the existing SearchFormPredictive +
 * SearchResultsPredictive primitives but styled with the new design tokens.
 */
export function SearchDrawer() {
  const {drawer, close} = useUIState();
  const open = drawer === 'search';
  const queriesDatalistId = useId();

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DrawerContent
        side="top"
        className="max-h-[85vh] rounded-b-[var(--radius-xl)]"
      >
        <DrawerHeader>
          <DrawerTitle className="uppercase tracking-[0.2em] text-xs">
            Search
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <SearchFormPredictive>
            {({fetchResults, goToSearch, inputRef}) => (
              <div className="flex items-center gap-3 border-b border-[var(--color-neutral-100)] pb-4">
                <Search
                  className="h-5 w-5 text-[var(--color-neutral-400)]"
                  strokeWidth={1.6}
                />
                <input
                  ref={inputRef}
                  name="q"
                  list={queriesDatalistId}
                  type="search"
                  placeholder="Search products, collections, journal…"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      goToSearch();
                    }
                  }}
                  className="flex-1 bg-transparent py-2 font-display text-2xl tracking-tight placeholder:text-[var(--color-neutral-400)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={goToSearch}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-neutral-500)] transition-colors hover:text-[var(--color-ink)]"
                >
                  Search
                </button>
              </div>
            )}
          </SearchFormPredictive>

          <div className="mt-6">
            <SearchResultsPredictive>
              {({items, total, term, state, closeSearch}) => {
                const {articles, collections, pages, products, queries} = items;

                if (state === 'loading' && term.current) {
                  return (
                    <p className="text-sm text-[var(--color-neutral-500)]">
                      Loading…
                    </p>
                  );
                }

                if (!total) {
                  return <SearchResultsPredictive.Empty term={term} />;
                }

                return (
                  <div className="grid gap-8 md:grid-cols-2">
                    <SearchResultsPredictive.Queries
                      queries={queries}
                      queriesDatalistId={queriesDatalistId}
                    />
                    <SearchResultsPredictive.Products
                      products={products}
                      closeSearch={closeSearch}
                      term={term}
                    />
                    <SearchResultsPredictive.Collections
                      collections={collections}
                      closeSearch={closeSearch}
                      term={term}
                    />
                    <SearchResultsPredictive.Pages
                      pages={pages}
                      closeSearch={closeSearch}
                      term={term}
                    />
                    <SearchResultsPredictive.Articles
                      articles={articles}
                      closeSearch={closeSearch}
                      term={term}
                    />
                    {term.current && total ? (
                      <Link
                        onClick={closeSearch}
                        to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                        className="md:col-span-2 mt-2 inline-flex items-center gap-2 self-start font-medium underline-offset-4 hover:underline"
                      >
                        View all results for &ldquo;{term.current}&rdquo; →
                      </Link>
                    ) : null}
                  </div>
                );
              }}
            </SearchResultsPredictive>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
