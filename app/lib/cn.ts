import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Compose class names with conflict resolution.
 * Use this everywhere instead of string concatenation so that conditional
 * Tailwind utilities deduplicate correctly (e.g. `cn('p-2', isLg && 'p-4')`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
