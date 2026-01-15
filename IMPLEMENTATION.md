# @oxog/routely - Implementation Guide

## Architecture Decisions

### 1. Monorepo Structure

**Decision:** Use pnpm workspaces for monorepo management.

**Rationale:**
- Efficient disk space usage with hard links
- Fast installation and builds
- Better than npm/yarn workspaces for monorepos
- Built-in workspace protocol support

**Structure:**
```
packages/
  core/     - Framework-agnostic routing logic
  react/    - React-specific bindings
plugins/    - Optional feature plugins
examples/   - Example applications
website/    - Documentation site
mcp/        - MCP server
```

### 2. Build System

**Decision:** Use tsup for building all packages.

**Rationale:**
- Zero-config TypeScript bundler
- Automatic dual ESM/CJS output
- Built-in declaration file generation
- Tree-shaking optimization
- Minimal bundle size

**Configuration:**
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
});
```

### 3. Type System

**Decision:** Use TypeScript template literal types for path parsing.

**Rationale:**
- Compile-time type safety
- Zero runtime overhead
- Automatic param extraction from paths
- Better DX with autocomplete

**Implementation:**
```typescript
type ExtractParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};
```

### 4. History Abstraction

**Decision:** Implement custom history layer, not using `history` package.

**Rationale:**
- Zero dependencies requirement
- Simpler API tailored to our needs
- Smaller bundle size
- Full control over behavior

**Implementations:**
- `BrowserHistory`: Uses `window.history` API
- `MemoryHistory`: In-memory stack for SSR/testing
- `HashHistory`: Uses URL hash for legacy support

### 5. Route Matching Algorithm

**Decision:** Custom path-to-regex implementation with ranking.

**Rationale:**
- Zero dependencies
- Optimized for common cases
- Supports all required features
- Predictable matching order

**Algorithm:**
1. Parse path into segments
2. Convert dynamic segments to regex patterns
3. Rank routes by specificity
4. Match URL against patterns
5. Extract params from matches

**Ranking Order:**
1. Static segments (highest priority)
2. Dynamic segments
3. Optional segments
4. Wildcards (lowest priority)

### 6. Plugin System

**Decision:** Event-driven plugin architecture with lifecycle hooks.

**Rationale:**
- Extensibility without bloat
- User pays only for what they use
- Third-party plugin support
- Predictable plugin behavior

**Lifecycle:**
```
register → install → init → [beforeNav, afterNav, ...] → destroy → unregister
```

### 7. React Integration

**Decision:** Use React Context for router state, not external store.

**Rationale:**
- Native React patterns
- No additional dependencies
- Automatic re-renders
- SSR compatible

**Context Structure:**
```typescript
interface RouterContextValue {
  router: Router;
  currentRoute: Route;
  navigate: NavigateFunction;
}
```

### 8. Testing Strategy

**Decision:** Vitest for unit/integration tests, no E2E framework.

**Rationale:**
- Fast execution
- Built-in coverage
- Compatible with Vite
- Great TypeScript support

**Coverage:**
- Unit tests: All utilities and algorithms
- Integration tests: Router + React
- Snapshot tests: Type inference
- Performance tests: Benchmarks

## Core Package Implementation

### File Structure

```
packages/core/src/
├── index.ts              # Public exports
├── kernel.ts             # Core router kernel
├── router.ts             # Router factory
├── matcher.ts            # Route matching
├── history.ts            # History implementations
├── registry.ts           # Type-safe registry
├── types.ts              # Type definitions
├── errors.ts             # Custom errors
└── utils.ts              # Utilities
```

### kernel.ts - Router Kernel

**Responsibilities:**
- Maintain current route state
- Emit navigation events
- Coordinate plugins
- Handle errors

**Key Functions:**
```typescript
class RouterKernel {
  private _currentRoute: Route | null = null;
  private _listeners = new Map<RouterEvent, Set<Function>>();
  private _plugins = new Map<string, RouterPlugin>();

  async navigate(to: string, options?: NavigateOptions): Promise<void> {
    // 1. Parse target URL
    // 2. Match route
    // 3. Emit beforeNavigate
    // 4. Check guards (via plugins)
    // 5. Update history
    // 6. Update current route
    // 7. Emit afterNavigate
  }

  on(event: RouterEvent, handler: Function): () => void {
    // Add listener and return unsubscribe function
  }

  use(plugin: RouterPlugin): this {
    // Register plugin and call install()
  }
}
```

### matcher.ts - Route Matching

**Algorithm:**

```typescript
function matchRoute(url: string, routes: RouteDefinition[]): RouteMatch | null {
  const segments = url.split('/').filter(Boolean);
  const ranked = rankRoutes(routes);

  for (const route of ranked) {
    const pattern = pathToRegex(route.path);
    const match = pattern.test(url);

    if (match) {
      return {
        route,
        params: extractParams(url, route.path),
      };
    }
  }

  return null;
}

function pathToRegex(path: string): RegExp {
  // Convert /users/:id to /users/([^/]+)
  let pattern = path
    .replace(/:[^/]+/g, '([^/]+)')      // :param → ([^/]+)
    .replace(/\*/g, '(.*)')              // * → (.*)
    .replace(/\/$/, '');                 // Remove trailing slash

  return new RegExp(`^${pattern}$`);
}

function rankRoutes(routes: RouteDefinition[]): RouteDefinition[] {
  return routes.sort((a, b) => {
    const scoreA = calculateScore(a.path);
    const scoreB = calculateScore(b.path);
    return scoreB - scoreA; // Higher score = higher priority
  });
}

function calculateScore(path: string): number {
  let score = 0;
  const segments = path.split('/').filter(Boolean);

  for (const segment of segments) {
    if (segment === '*') {
      score += 1; // Wildcard = lowest
    } else if (segment.startsWith(':')) {
      score += 100; // Dynamic param
    } else {
      score += 1000; // Static = highest
    }
  }

  return score;
}
```

### history.ts - History Implementations

**BrowserHistory:**

```typescript
function createBrowserHistory(): History {
  const listeners = new Set<LocationListener>();

  const location: Location = {
    get pathname() { return window.location.pathname; },
    get search() { return window.location.search; },
    get hash() { return window.location.hash; },
    get state() { return window.history.state; },
  };

  const push = (path: string, state?: unknown) => {
    window.history.pushState(state, '', path);
    notifyListeners();
  };

  const replace = (path: string, state?: unknown) => {
    window.history.replaceState(state, '', path);
    notifyListeners();
  };

  const go = (delta: number) => {
    window.history.go(delta);
  };

  const listen = (listener: LocationListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const notifyListeners = () => {
    listeners.forEach(listener => listener(location));
  };

  // Listen to popstate
  window.addEventListener('popstate', notifyListeners);

  return { location, push, replace, go, back: () => go(-1), forward: () => go(1), listen };
}
```

**MemoryHistory:**

```typescript
function createMemoryHistory(options?: MemoryHistoryOptions): History {
  const entries = [...(options?.initialEntries || ['/'])];
  let index = options?.initialIndex ?? entries.length - 1;
  const listeners = new Set<LocationListener>();

  const getLocation = (): Location => {
    const url = new URL(entries[index], 'http://localhost');
    return {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      state: null,
    };
  };

  const push = (path: string, state?: unknown) => {
    index++;
    entries.splice(index, entries.length - index, path);
    notifyListeners();
  };

  const replace = (path: string, state?: unknown) => {
    entries[index] = path;
    notifyListeners();
  };

  const go = (delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < entries.length) {
      index = nextIndex;
      notifyListeners();
    }
  };

  // ... similar to BrowserHistory
}
```

### registry.ts - Type-Safe Registry

**Implementation:**

```typescript
type RouteRegistry = Record<string, string | RouteRegistry>;

function createRoutes<T extends RouteRegistry>(registry: T): TypedRoutes<T> {
  return new Proxy({} as TypedRoutes<T>, {
    get(target, prop: string) {
      const value = registry[prop];

      if (typeof value === 'string') {
        return createRouteRef(value);
      } else if (typeof value === 'object') {
        return createRoutes(value);
      }

      return undefined;
    }
  });
}

function createRouteRef(path: string): RouteRef {
  return {
    path,
    toString: () => path,
    build: (params: Record<string, string>) => {
      return path.replace(/:([^/]+)/g, (_, key) => params[key]);
    }
  };
}

// Type helpers
type TypedRoutes<T extends RouteRegistry> = {
  [K in keyof T]: T[K] extends string
    ? RouteRef<ExtractParams<T[K]>>
    : T[K] extends RouteRegistry
    ? TypedRoutes<T[K]>
    : never;
};
```

### errors.ts - Custom Errors

```typescript
export class RouterError extends Error {
  constructor(
    public code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR',
    message: string,
    public route?: Route,
    public plugin?: string
  ) {
    super(message);
    this.name = 'RouterError';
  }
}

export function createNotFoundError(path: string): RouterError {
  return new RouterError(
    'ROUTE_NOT_FOUND',
    `No route found for path: ${path}`
  );
}

export function createGuardError(route: Route, plugin: string): RouterError {
  return new RouterError(
    'GUARD_REJECTED',
    `Navigation to ${route.path} was rejected by guard`,
    route,
    plugin
  );
}

export function createPluginError(plugin: string, originalError: Error): RouterError {
  return new RouterError(
    'PLUGIN_ERROR',
    `Plugin "${plugin}" threw an error: ${originalError.message}`,
    undefined,
    plugin
  );
}
```

## React Package Implementation

### File Structure

```
packages/react/src/
├── index.ts              # Public exports
├── context.ts            # Router context
├── provider.ts           # RouterProvider component
├── hooks.ts              # React hooks
├── components.ts         # Link, Outlet components
└── types.ts              # React-specific types
```

### context.ts - Router Context

```typescript
interface RouterContextValue {
  router: Router;
  currentRoute: Route;
}

export const RouterContext = React.createContext<RouterContextValue | null>(null);

export function useRouterContext(): RouterContextValue {
  const context = React.useContext(RouterContext);

  if (!context) {
    throw new Error('useRouterContext must be used within RouterProvider');
  }

  return context;
}
```

### provider.ts - RouterProvider

```typescript
export function RouterProvider({
  router,
  children,
}: RouterProviderProps): React.ReactElement {
  const [currentRoute, setCurrentRoute] = React.useState(router.currentRoute);

  React.useEffect(() => {
    const unsubscribe = router.on('afterNavigate', (route: Route) => {
      setCurrentRoute(route);
    });

    return unsubscribe;
  }, [router]);

  const value = React.useMemo(
    () => ({ router, currentRoute }),
    [router, currentRoute]
  );

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}
```

### hooks.ts - React Hooks

```typescript
export function useNavigate(): NavigateFunction {
  const { router } = useRouterContext();

  return React.useCallback(
    (to: string | number | RouteRef, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        router.go(to);
      } else if (typeof to === 'string') {
        router.navigate(to, options);
      } else {
        router.navigate(to.path, options);
      }
    },
    [router]
  );
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { currentRoute } = useRouterContext();
  return currentRoute.params as T;
}

export function useRoute(): Route {
  const { currentRoute } = useRouterContext();
  return currentRoute;
}
```

### components.ts - Link & Outlet

```typescript
export function Link({
  to,
  children,
  activeClassName,
  replace,
  state,
  ...props
}: LinkProps): React.ReactElement {
  const navigate = useNavigate();
  const { currentRoute } = useRouterContext();

  const href = typeof to === 'string' ? to : to.path;
  const isActive = currentRoute.path === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to, { replace, state });
  };

  return (
    <a
      {...props}
      href={href}
      onClick={handleClick}
      className={isActive && activeClassName ? activeClassName : props.className}
    >
      {children}
    </a>
  );
}

export function Outlet(): React.ReactElement | null {
  const { currentRoute, router } = useRouterContext();

  if (!currentRoute) {
    return null;
  }

  const matchedRoute = router.routes.find(r => r.path === currentRoute.path);

  if (!matchedRoute) {
    return null;
  }

  const Component = matchedRoute.component;

  return <Component />;
}
```

## Build Configuration

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  outDir: 'dist',
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
});
```

## Performance Optimizations

### 1. Route Matching Cache

```typescript
class RouteMatcher {
  private cache = new Map<string, RouteMatch | null>();

  match(url: string, routes: RouteDefinition[]): RouteMatch | null {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const match = this.matchRoute(url, routes);
    this.cache.set(url, match);

    return match;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

### 2. Context Optimization

```typescript
// Split context to avoid unnecessary re-renders
const RouterStateContext = React.createContext<RouterState | null>(null);
const RouterActionsContext = React.createContext<RouterActions | null>(null);

// Components can subscribe to only what they need
function useRouterState() {
  return React.useContext(RouterStateContext);
}

function useRouterActions() {
  return React.useContext(RouterActionsContext);
}
```

## Security Considerations

### 1. XSS Prevention

```typescript
// Sanitize user input in routes
function sanitizePath(path: string): string {
  return path.replace(/<[^>]*>/g, '');
}
```

### 2. CSRF Protection

```typescript
// Add token to navigation state
navigate('/api/action', {
  state: { csrf: getCsrfToken() }
});
```

### 3. Route Validation

```typescript
// Validate routes on creation
function validateRoute(route: RouteDefinition): void {
  if (!route.path.startsWith('/') && route.path !== '*') {
    throw new Error('Route path must start with "/"');
  }

  if (route.path.includes('//')) {
    throw new Error('Route path cannot contain "//"');
  }
}
```

## SSR Considerations

### Server-Side Setup

```typescript
// Use MemoryHistory for SSR
const history = createMemoryHistory({
  initialEntries: [req.url],
});

const router = createRouter({
  routes,
  history,
});

// Render
const html = renderToString(
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
);
```

### Hydration

```typescript
// Client-side hydration
const history = createBrowserHistory();

const router = createRouter({
  routes,
  history,
});

hydrateRoot(
  document.getElementById('root'),
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
);
```

## Testing Strategy

### Unit Tests

```typescript
describe('matchRoute', () => {
  it('should match static routes', () => {
    const routes = [route('/users', Users)];
    const match = matchRoute('/users', routes);
    expect(match).toBeDefined();
    expect(match?.route.path).toBe('/users');
  });

  it('should match dynamic routes', () => {
    const routes = [route('/users/:id', UserDetail)];
    const match = matchRoute('/users/123', routes);
    expect(match?.params).toEqual({ id: '123' });
  });
});
```

---

**This implementation guide provides all architectural decisions and technical details needed to build the package.**
