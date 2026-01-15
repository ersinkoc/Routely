/**
 * React-specific type definitions for Routely.
 * @packageDocumentation
 */

import type { Router, NavigateOptions, RouteRef } from '@oxog/routely-core';
import type { ReactNode, AnchorHTMLAttributes } from 'react';

/**
 * RouterProvider component props.
 */
export interface RouterProviderProps {
  /** Router instance */
  router: Router;
  /** Children components */
  children: ReactNode;
}

/**
 * Link component props.
 */
export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Target path or route reference */
  to: string | RouteRef;
  /** Class name to apply when link is active */
  activeClassName?: string;
  /** Replace current history entry */
  replace?: boolean;
  /** State data to pass */
  state?: unknown;
  /** Children */
  children: ReactNode;
}

/**
 * Navigate function type.
 */
export type NavigateFunction = {
  (to: string | RouteRef, options?: NavigateOptions): void;
  (delta: number): void;
};

/**
 * useSearch hook return type.
 */
export interface UseSearchReturn<T extends Record<string, any>> {
  /** Current search params */
  search: T;
  /** Update search params */
  setSearch: (value: T | ((prev: T) => T)) => void;
}
