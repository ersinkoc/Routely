# @oxog/routely - Complete Specification

## Project Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/routely` |
| **Core Package** | `@oxog/routely-core` |
| **GitHub Repository** | `https://github.com/ersinkoc/routely` |
| **Documentation Site** | `https://routely.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |
| **Version** | 1.0.0 |

## Description

**Tagline:** The router that respects your bundle. Type-safe, extensible, tiny.

Routely is a micro-kernel based router for React applications that prioritizes:
- **Bundle Size**: Core ~1.5KB, React adapter ~2.5KB total (gzipped)
- **Type Safety**: Full TypeScript support with type inference
- **Extensibility**: Plugin-based architecture, pay only for what you use
- **Zero Dependencies**: No runtime dependencies whatsoever

## Architecture Overview

### Monorepo Structure

```
routely/
├── packages/
│   ├── core/                 # @oxog/routely-core (framework-agnostic)
│   └── react/                # @oxog/routely (main package)
├── plugins/                  # Optional plugins
│   ├── lazy/
│   ├── guards/
│   ├── search/
│   ├── scroll/
│   ├── transition/
│   ├── breadcrumb/
│   └── devtools/
├── examples/                 # 15+ examples
├── website/                  # Documentation site
├── mcp/                      # MCP server
└── llms.txt                  # LLM-native documentation
```

### Micro-Kernel Design

```
┌─────────────────────────────────────────────────┐
│                  User Code                       │
│         <Route>, <Link>, useNavigate()          │
├─────────────────────────────────────────────────┤
│              Plugin Registry                     │
│      use() · register() · unregister()          │
├────────┬────────┬────────┬────────┬─────────────┤
│  Link  │ Outlet │ Lazy   │ Guards │ Community   │
│ Plugin │ Plugin │ Plugin │ Plugin │ Plugins...  │
├────────┴────────┴────────┴────────┴─────────────┤
│               Routely Kernel                     │
│  Route Matching · Navigation · History · Types  │
└─────────────────────────────────────────────────┘
```

**Kernel Responsibilities:**
- Route definition & matching
- Navigation (push, replace, back, forward, go)
- History abstraction (browser/memory/hash)
- Type-safe params & route registry
- Event bus (beforeNavigate, afterNavigate, error)
- Plugin registration and lifecycle
- Error boundary and recovery

## Technical Requirements

| Requirement | Value |
|-------------|-------|
| Runtime | Universal (Browser + SSR) |
| Module Format | ESM + CJS (dual package) |
| Node.js Version | >= 18 |
| React Version | >= 18 (peer dependency) |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 1.5KB gzipped |
| Bundle Size (react) | < 2.5KB gzipped (includes core) |
| Bundle Size (all plugins) | < 10KB gzipped |
| Test Coverage | 100% |
| Runtime Dependencies | ZERO |

## Core API Specification

### 1. Router Creation

```typescript
import { createRouter, route } from '@oxog/routely';

const router = createRouter({
  routes: RouteDefinition[];
  history?: History;
  basePath?: string;
});
```

**Parameters:**
- `routes`: Array of route definitions
- `history`: Optional history instance (defaults to browser history)
- `basePath`: Optional base path for all routes (e.g., `/app`)

**Returns:** Router instance

### 2. Route Definition

```typescript
route(path: string, component: React.ComponentType, children?: RouteDefinition[], meta?: Record<string, unknown>)
```

**Path Patterns:**
- Static: `/users`
- Dynamic params: `/users/:id`
- Optional segments: `/users/:id?`
- Wildcards: `/blog/*` or `*` (catch-all)
- Nested: Automatic path concatenation

**Examples:**
```typescript
route('/', Home)
route('/users', Users)
route('/users/:id', UserDetail)
route('/users/:id/edit', UserEdit)
route('/blog/*', BlogPost)
route('*', NotFound)
```

### 3. Type-Safe Route Registry

```typescript
import { createRoutes } from '@oxog/routely';

const routes = createRoutes({
  home: '/',
  users: {
    list: '/users',
    detail: '/users/:id',
    edit: '/users/:id/edit',
  },
  settings: '/settings',
});

// TypeScript infers param types
navigate(routes.users.detail, { id: '123' }); // ✅
navigate(routes.users.detail, {}); // ❌ Error: 'id' required
```

**Type Inference:**
- Extract params from path patterns
- Enforce required params at compile-time
- Type-safe navigation helpers

### 4. Navigation API

```typescript
const navigate = useNavigate();

// String navigation
navigate('/users');

// Type-safe navigation
navigate(routes.users.detail, { id: '123' });

// With options
navigate('/users', { replace: true });
navigate('/users', { state: { from: 'home' } });

// Relative navigation
navigate(-1);  // back
navigate(1);   // forward
navigate(-2);  // back 2 steps
```

**NavigateOptions:**
```typescript
interface NavigateOptions {
  replace?: boolean;  // Replace current history entry
  state?: unknown;    // Arbitrary state data
}
```

### 5. History Abstraction

```typescript
// Browser history (default)
const history = createBrowserHistory();

// Memory history (SSR/testing)
const history = createMemoryHistory({
  initialEntries: ['/'],
  initialIndex: 0,
});

// Hash history
const history = createHashHistory();
```

**History Interface:**
```typescript
interface History {
  readonly location: Location;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  go(delta: number): void;
  back(): void;
  forward(): void;
  listen(listener: LocationListener): () => void;
}

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}
```

### 6. React Components

#### RouterProvider

```typescript
<RouterProvider router={router}>
  <App />
</RouterProvider>
```

Provides router context to the entire application.

#### Link

```typescript
<Link
  to="/users"
  activeClassName="active"
  replace={false}
  state={{ from: 'home' }}
>
  Users
</Link>
```

**Props:**
- `to`: string | RouteRef
- `activeClassName?`: string (class when route active)
- `replace?`: boolean
- `state?`: unknown
- All other props passed to `<a>`

#### Outlet

```typescript
<Outlet />
```

Renders matched child routes.

### 7. React Hooks

#### useNavigate

```typescript
const navigate = useNavigate();
navigate('/path');
navigate(routes.users.detail, { id: '123' });
navigate(-1);
```

#### useParams

```typescript
const params = useParams<{ id: string }>();
console.log(params.id);
```

#### useRoute

```typescript
const route = useRoute();
console.log(route.path);
console.log(route.params);
console.log(route.search);
console.log(route.hash);
console.log(route.state);
console.log(route.meta);
```

#### useSearch (from searchPlugin)

```typescript
const { search, setSearch } = useSearch<{
  page: number;
  sort: 'asc' | 'desc';
}>();

console.log(search.page);
setSearch({ page: 2 });
setSearch(prev => ({ ...prev, sort: 'asc' }));
```

### 8. Router Instance API

```typescript
interface Router {
  // State
  readonly currentRoute: Route;
  readonly routes: RouteDefinition[];

  // Navigation
  navigate(to: string | RouteRef, options?: NavigateOptions): void;
  back(): void;
  forward(): void;
  go(delta: number): void;

  // Plugins
  use(plugin: RouterPlugin): Router;
  unregister(name: string): void;
  list(): string[];

  // Events
  on(event: RouterEvent, handler: RouterEventHandler): () => void;
  off(event: RouterEvent, handler: RouterEventHandler): void;
}
```

## Plugin System Specification

### Plugin Interface

```typescript
interface RouterPlugin {
  name: string;              // Unique identifier (kebab-case)
  version: string;           // Semantic version
  dependencies?: string[];   // Other plugin names

  install: (router: Router) => void;
  onInit?: () => void | Promise<void>;
  onBeforeNavigate?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
  onAfterNavigate?: (route: Route) => void;
  onDestroy?: () => void | Promise<void>;
  onError?: (error: RouterError) => void;
}
```

### Core Plugins (Auto-loaded)

1. **linkPlugin** - Powers `<Link>` component
2. **outletPlugin** - Powers `<Outlet>` component

### Optional Plugins

#### 1. lazyPlugin

```typescript
import { lazyPlugin, lazy } from '@oxog/routely/plugins';

router.use(lazyPlugin({
  fallback: <Loading />,
  timeout: 10000,
}));

const routes = [
  route('/dashboard', lazy(() => import('./Dashboard'))),
];
```

**Features:**
- Dynamic imports
- Code splitting
- Suspense integration
- Timeout handling
- Per-route fallback

#### 2. guardsPlugin

```typescript
import { guardsPlugin } from '@oxog/routely/plugins';

router.use(guardsPlugin({
  '/admin': () => user.isAdmin,
  '/profile': async () => {
    const session = await checkSession();
    return session.valid;
  },
  '/settings': {
    guard: () => isAuthenticated(),
    redirect: '/login',
  },
  '/admin/*': () => user.isAdmin,
}));
```

**Features:**
- Boolean guards
- Async guards
- Redirect on failure
- Wildcard patterns

#### 3. searchPlugin

```typescript
import { searchPlugin, useSearch } from '@oxog/routely/plugins';

router.use(searchPlugin({
  parse: (search) => new URLSearchParams(search),
  stringify: (params) => params.toString(),
}));
```

**Features:**
- Type-safe query params
- Custom parse/stringify
- React hook integration

#### 4. scrollPlugin

```typescript
import { scrollPlugin } from '@oxog/routely/plugins';

router.use(scrollPlugin({
  restoration: true,
  scrollToTop: true,
  behavior: 'smooth',
  exclude: ['/modal/*'],
}));
```

**Features:**
- Scroll position restoration
- Auto scroll to top
- Custom behavior
- Route exclusion

#### 5. transitionPlugin

```typescript
import { transitionPlugin, useTransition } from '@oxog/routely/plugins';

router.use(transitionPlugin({
  duration: 300,
  type: 'fade',
}));
```

**Features:**
- Page transitions
- Transition states
- Custom animations

#### 6. breadcrumbPlugin

```typescript
import { breadcrumbPlugin, useBreadcrumbs } from '@oxog/routely/plugins';

router.use(breadcrumbPlugin({
  labelFn: (route) => route.meta?.title || route.path,
}));
```

**Features:**
- Auto breadcrumb generation
- Custom label function
- Route metadata integration

#### 7. devtoolsPlugin

```typescript
import { devtoolsPlugin } from '@oxog/routely/plugins';

if (process.env.NODE_ENV === 'development') {
  router.use(devtoolsPlugin({
    position: 'bottom-right',
    collapsed: true,
  }));
}
```

**Features:**
- Route tree visualization
- Navigation history
- Current route details
- Params inspector
- Plugin list

## Type System Specification

### Core Types

```typescript
export interface Route {
  path: string;
  params: Record<string, string>;
  search: Record<string, string>;
  hash: string;
  state: unknown;
  meta: Record<string, unknown>;
}

export interface RouteDefinition<TParams = unknown> {
  path: string;
  component: React.ComponentType;
  children?: RouteDefinition[];
  meta?: Record<string, unknown>;
}

export interface RouterOptions {
  routes: RouteDefinition[];
  history?: History;
  basePath?: string;
}

export type RouterEvent =
  | 'beforeNavigate'
  | 'afterNavigate'
  | 'error';

export interface RouterError extends Error {
  code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR';
  route?: Route;
  plugin?: string;
}
```

### Type Inference

```typescript
// Extract params from path
type ExtractParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

// Example usage
type Params1 = ExtractParams<'/users/:id'>;
// Result: { id: string }

type Params2 = ExtractParams<'/users/:id/posts/:postId'>;
// Result: { id: string; postId: string }
```

## Error Handling Specification

### Error Codes

| Code | Meaning | Handler |
|------|---------|---------|
| `ROUTE_NOT_FOUND` | No matching route found | Render fallback or 404 |
| `GUARD_REJECTED` | Navigation blocked by guard | Redirect or show error |
| `PLUGIN_ERROR` | Plugin threw error | Log and continue |

### Error Boundaries

```typescript
router.on('error', (error: RouterError) => {
  console.error(`Router error [${error.code}]:`, error.message);

  if (error.code === 'ROUTE_NOT_FOUND') {
    navigate('/404');
  } else if (error.code === 'GUARD_REJECTED') {
    navigate('/login');
  }
});
```

## Bundle Size Requirements

| Package | Uncompressed | Gzipped | Brotli |
|---------|--------------|---------|--------|
| @oxog/routely-core | ~4KB | <1.5KB | <1.3KB |
| @oxog/routely | ~7KB | <2.5KB | <2.2KB |
| lazyPlugin | ~2KB | <800B | <700B |
| guardsPlugin | ~2KB | <800B | <700B |
| searchPlugin | ~2KB | <800B | <700B |
| scrollPlugin | ~1.5KB | <600B | <500B |
| transitionPlugin | ~2KB | <800B | <700B |
| breadcrumbPlugin | ~1.5KB | <600B | <500B |
| devtoolsPlugin | ~10KB | <4KB | <3.5KB |
| **Total (all)** | ~32KB | <10KB | <9KB |

## Testing Requirements

### Coverage Thresholds

```json
{
  "coverage": {
    "branches": 100,
    "functions": 100,
    "lines": 100,
    "statements": 100
  }
}
```

### Test Categories

1. **Unit Tests**
   - Route matching algorithm
   - Path parsing
   - Param extraction
   - History implementations
   - Plugin system
   - Type utilities

2. **Integration Tests**
   - Router + React integration
   - Plugin interactions
   - Navigation flows
   - SSR compatibility

3. **End-to-End Tests**
   - Example applications
   - Real-world scenarios
   - Performance benchmarks

## Documentation Requirements

### README.md Structure

1. Quick start (< 50 lines of code)
2. Features overview
3. Installation
4. Basic usage
5. API reference (brief)
6. Plugin catalog
7. Examples link
8. Contributing (none - solo project)
9. License

### API Documentation

- Every public API must have JSDoc
- Every function must have `@example`
- Every type must have description
- Complex types need detailed explanation

### Examples (15+ Required)

```
examples/
├── 01-basic/
│   ├── minimal/
│   ├── nested-routes/
│   └── not-found/
├── 02-navigation/
│   ├── programmatic/
│   ├── link-active/
│   └── params/
├── 03-plugins/
│   ├── lazy-loading/
│   ├── auth-guards/
│   └── search-params/
├── 04-typescript/
│   ├── type-safe-routes/
│   └── generic-params/
├── 05-integrations/
│   ├── react-query/
│   ├── zustand/
│   └── framer-motion/
└── 06-real-world/
    ├── dashboard/
    ├── e-commerce/
    └── blog/
```

## LLM-Native Requirements

### llms.txt File

- Location: `/llms.txt`
- Size: < 2000 tokens
- Content: Quick reference for AI assistants
- Format: Markdown
- Sections: Install, Basic Usage, API Summary, Plugins, Common Patterns, Errors, Links

### API Naming Standards

**Predictable Patterns:**
- Factories: `create*()` (createRouter, createBrowserHistory)
- Builders: `route()`, `lazy()`
- Hooks: `use*()` (useNavigate, useParams, useRoute, useSearch)
- Components: PascalCase (Link, Outlet, RouterProvider)

**AVOID:**
- `make*()`, `define*()`, `get*()`, `Render()`
- Inconsistent naming
- Ambiguous terms

## MCP Server Specification

### Tool 1: routely_docs

```typescript
{
  name: 'routely_docs',
  description: 'Search Routely documentation',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      section: {
        type: 'string',
        enum: ['api', 'guides', 'plugins', 'examples']
      }
    },
    required: ['query']
  }
}
```

### Tool 2: routely_example

```typescript
{
  name: 'routely_example',
  description: 'Get Routely code examples',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      category: {
        type: 'string',
        enum: ['basic', 'navigation', 'plugins', 'typescript', 'integrations', 'real-world']
      }
    },
    required: ['name']
  }
}
```

### Tool 3: routely_migrate

```typescript
{
  name: 'routely_migrate',
  description: 'Generate migration code from React Router or TanStack Router',
  inputSchema: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        enum: ['react-router', 'tanstack-router']
      },
      code: { type: 'string' }
    },
    required: ['from', 'code']
  }
}
```

## Website Specification

### Tech Stack

- React 18+
- TypeScript 5+
- Vite
- Tailwind CSS
- @oxog/codeshine (syntax highlighting)
- Lucide React (icons)

### Pages

1. **Home** (`/`)
   - Hero section
   - Feature highlights
   - Quick start code
   - Comparison table

2. **Documentation** (`/docs`)
   - Getting Started
   - Core Concepts
   - API Reference
   - Plugins Guide

3. **Examples** (`/examples`)
   - Interactive examples
   - CodeSandbox links

4. **Plugins** (`/plugins`)
   - Plugin catalog
   - Installation instructions

### Design Requirements

- Dark/Light theme toggle
- IDE-style code blocks
- Responsive design
- GitHub star button
- Footer: "Made with ❤️ by Ersin KOÇ"
- CNAME: `routely.oxog.dev`

## Publishing Requirements

### NPM Package Metadata

```json
{
  "name": "@oxog/routely",
  "version": "1.0.0",
  "description": "The router that respects your bundle. Type-safe, extensible, tiny.",
  "keywords": [
    "router",
    "react-router",
    "type-safe",
    "typescript",
    "routing",
    "spa",
    "ssr",
    "plugin",
    "lightweight",
    "minimal",
    "navigation",
    "tanstack-alternative"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/routely.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/routely/issues"
  },
  "homepage": "https://routely.oxog.dev"
}
```

### Files Included

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

## Performance Requirements

### Benchmarks

| Metric | Target |
|--------|--------|
| Route matching (1000 routes) | < 1ms |
| Navigation (client-side) | < 5ms |
| Initial render | < 10ms |
| Plugin registration | < 1ms |
| Type inference (TSC) | < 100ms |

### Optimization Strategies

1. **Tree-shaking**: All exports are ESM
2. **Side effects**: Mark as `"sideEffects": false`
3. **Code splitting**: Lazy loading support
4. **Memoization**: Cache route matches
5. **Minimal re-renders**: Context optimization

## Accessibility Requirements

### Link Component

- Proper semantic HTML (`<a>` tags)
- Keyboard navigation support
- ARIA attributes when needed
- Active state indication

### Router Provider

- Focus management on navigation
- Announce route changes to screen readers
- Skip links support

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Node.js | 18+ |

## Success Criteria

- [x] Zero runtime dependencies
- [x] 100% test coverage
- [x] < 2.5KB gzipped (core + React)
- [x] Full TypeScript support
- [x] Plugin system working
- [x] 15+ examples
- [x] Complete documentation
- [x] MCP server functional
- [x] llms.txt created
- [x] Website deployed
- [x] All tests passing
- [x] Production ready

---

**This specification is complete and ready for implementation.**
