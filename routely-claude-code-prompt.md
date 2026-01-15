# @oxog/routely - Zero-Dependency NPM Package

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/routely` |
| **GitHub Repository** | `https://github.com/ersinkoc/routely` |
| **Documentation Site** | `https://routely.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** The router that respects your bundle. Type-safe, extensible, tiny.

Routely is a micro-kernel based router for React applications that prioritizes bundle size, type safety, and extensibility. With a framework-agnostic core (~1.5KB) and React adapter (~2.5KB total), it provides everything you need for modern SPA and SSR routing without the bloat. Every feature beyond core routing is a plugin, letting you pay only for what you use.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No lodash, no axios, no moment - nothing
- Write your own utilities, parsers, validators
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "react": "^18.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  }
}
```

**Note:** `react` is a peerDependency, not a runtime dependency.

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

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

**Kernel responsibilities (minimal):**
- Route definition & matching
- Navigation (push, replace, back, forward)
- History abstraction (browser/memory/hash)
- Type-safe params & route registry
- Event bus (onBeforeNavigate, onAfterNavigate)
- Plugin registration and lifecycle
- Error boundary and recovery

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions  
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

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
    "jsx": "react-jsx"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`create`, `get`, `set`, `use`, `remove`)
- **Rich JSDoc** with @example on every public API
- **15+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (routely.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## PACKAGE STRUCTURE

This is a **monorepo-style structure** with two packages:

```
routely/
├── packages/
│   ├── core/                    # @oxog/routely-core
│   │   ├── src/
│   │   │   ├── index.ts         # Main entry
│   │   │   ├── kernel.ts        # Micro kernel
│   │   │   ├── router.ts        # Router creation
│   │   │   ├── matcher.ts       # Route matching algorithm
│   │   │   ├── history.ts       # History abstraction
│   │   │   ├── registry.ts      # Type-safe route registry
│   │   │   ├── types.ts         # Type definitions
│   │   │   └── errors.ts        # Custom errors
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── react/                   # @oxog/routely (main package)
│       ├── src/
│       │   ├── index.ts         # Re-exports core + React bindings
│       │   ├── context.ts       # React context
│       │   ├── provider.ts      # RouterProvider component
│       │   ├── hooks.ts         # useNavigate, useParams, etc.
│       │   ├── components.ts    # Link, Outlet components
│       │   └── types.ts         # React-specific types
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── plugins/                     # Optional plugins
│   ├── lazy/
│   │   ├── src/index.ts
│   │   ├── tests/
│   │   └── package.json
│   ├── guards/
│   ├── search/
│   ├── scroll/
│   ├── transition/
│   ├── breadcrumb/
│   └── devtools/
│
├── examples/
│   ├── 01-basic/
│   │   ├── minimal/
│   │   ├── nested-routes/
│   │   └── not-found/
│   ├── 02-navigation/
│   │   ├── programmatic/
│   │   ├── link-active/
│   │   └── params/
│   ├── 03-plugins/
│   │   ├── lazy-loading/
│   │   ├── auth-guards/
│   │   └── search-params/
│   ├── 04-typescript/
│   │   ├── type-safe-routes/
│   │   └── generic-params/
│   ├── 05-integrations/
│   │   ├── react-query/
│   │   ├── zustand/
│   │   └── framer-motion/
│   └── 06-real-world/
│       ├── dashboard/
│       ├── e-commerce/
│       └── blog/
│
├── website/                     # routely.oxog.dev
│   ├── public/
│   │   ├── CNAME                # routely.oxog.dev
│   │   └── llms.txt             # Copied from root
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── mcp/                         # MCP Server
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/
│   │   │   ├── docs.ts          # routely_docs tool
│   │   │   ├── example.ts       # routely_example tool
│   │   │   └── migrate.ts       # routely_migrate tool
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json                 # Root workspace
├── tsconfig.json
├── pnpm-workspace.yaml
└── .gitignore
```

---

## CORE FEATURES

### 1. Route Definition & Matching

Type-safe route definitions with nested routes support.

```typescript
import { createRouter, route } from '@oxog/routely';

const router = createRouter({
  routes: [
    route('/', Home),
    route('/users', Users, [
      route(':id', UserDetail),
      route(':id/edit', UserEdit),
    ]),
    route('/settings', Settings),
    route('*', NotFound),
  ],
});
```

**Implementation Requirements:**
- Path-to-regex style matching (implement from scratch)
- Support for: static segments, dynamic params (`:id`), wildcards (`*`), optional segments (`?`)
- Nested routes with automatic path concatenation
- Route ranking for ambiguous matches

### 2. Type-Safe Route Registry

Full TypeScript support with compile-time route validation.

```typescript
// routes.ts - Define routes with full type safety
import { createRoutes } from '@oxog/routely';

export const routes = createRoutes({
  home: '/',
  users: {
    list: '/users',
    detail: '/users/:id',
    edit: '/users/:id/edit',
  },
  settings: '/settings',
});

// Usage - TypeScript enforces correct params
import { routes } from './routes';

navigate(routes.users.detail, { id: '123' }); // ✅ OK
navigate(routes.users.detail, {});             // ❌ Error: 'id' is required
navigate(routes.users.detail, { id: 123 });    // ❌ Error: 'id' must be string
```

**Implementation Requirements:**
- Infer param types from route paths
- Generate typed navigation helpers
- Compile-time validation of required params
- Support for search params typing

### 3. Navigation API

Programmatic navigation with full type safety.

```typescript
const navigate = useNavigate();

// Basic navigation
navigate('/users');

// With params (type-safe via registry)
navigate(routes.users.detail, { id: '123' });

// Navigation options
navigate('/users', { replace: true });
navigate('/users', { state: { from: 'home' } });

// Relative navigation
navigate(-1);  // back
navigate(1);   // forward
```

### 4. History Abstraction

Support for different history modes.

```typescript
import { createRouter, createBrowserHistory, createMemoryHistory, createHashHistory } from '@oxog/routely';

// Browser history (default) - /users/123
const router = createRouter({
  history: createBrowserHistory(),
  routes: [...],
});

// Memory history (for SSR/testing) - no URL
const router = createRouter({
  history: createMemoryHistory({ initialEntries: ['/'] }),
  routes: [...],
});

// Hash history - /#/users/123
const router = createRouter({
  history: createHashHistory(),
  routes: [...],
});
```

### 5. React Integration

Seamless React components and hooks.

```tsx
import { RouterProvider, Link, Outlet, useNavigate, useParams, useRoute, useSearch } from '@oxog/routely';

function App() {
  return (
    <RouterProvider router={router}>
      <Layout />
    </RouterProvider>
  );
}

function Layout() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users" activeClassName="active">Users</Link>
    </nav>
    <main>
      <Outlet />
    </main>
  );
}

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const route = useRoute();
  
  return <div>User {id}</div>;
}
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Router plugin interface for extending functionality.
 * 
 * @typeParam TContext - Router context type
 * 
 * @example
 * ```typescript
 * const myPlugin: RouterPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install: (router) => {
 *     router.on('beforeNavigate', (to, from) => {
 *       console.log(`Navigating from ${from.path} to ${to.path}`);
 *     });
 *   },
 * };
 * ```
 */
export interface RouterPlugin {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  
  /** Semantic version */
  version: string;
  
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  
  /**
   * Called when plugin is registered.
   * @param router - The router instance
   */
  install: (router: Router) => void;
  
  /**
   * Called after all plugins installed and router is ready.
   */
  onInit?: () => void | Promise<void>;
  
  /**
   * Called before navigation occurs.
   * Return false to cancel navigation.
   */
  onBeforeNavigate?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
  
  /**
   * Called after navigation completes.
   */
  onAfterNavigate?: (route: Route) => void;
  
  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;
  
  /**
   * Called on error in this plugin.
   */
  onError?: (error: RouterError) => void;
}
```

### Plugin Registration

```typescript
import { createRouter } from '@oxog/routely';
import { lazyPlugin, guardsPlugin, searchPlugin } from '@oxog/routely/plugins';

const router = createRouter({ routes: [...] })
  .use(lazyPlugin())
  .use(guardsPlugin({
    '/settings': () => isAuthenticated(),
    '/admin/*': () => isAdmin(),
  }))
  .use(searchPlugin());

// Runtime plugin management
router.unregister('guards');
router.list(); // ['lazy', 'search']
```

### Core Plugins (Built-in)

| Plugin | Description | Auto-loaded |
|--------|-------------|-------------|
| `linkPlugin` | `<Link>` component with active state | Yes |
| `outletPlugin` | `<Outlet>` for nested route rendering | Yes |

### Optional Plugins (v1)

| Plugin | Package | Description |
|--------|---------|-------------|
| `lazyPlugin` | `@oxog/routely-plugin-lazy` | Dynamic imports, code splitting |
| `guardsPlugin` | `@oxog/routely-plugin-guards` | Route guards, auth protection |
| `searchPlugin` | `@oxog/routely-plugin-search` | Type-safe search/query params |
| `scrollPlugin` | `@oxog/routely-plugin-scroll` | Scroll position restoration |
| `transitionPlugin` | `@oxog/routely-plugin-transition` | Page transition animations |
| `breadcrumbPlugin` | `@oxog/routely-plugin-breadcrumb` | Auto breadcrumb generation |
| `devtoolsPlugin` | `@oxog/routely-plugin-devtools` | Debug panel, route inspector |

---

## PLUGIN SPECIFICATIONS

### lazyPlugin

```typescript
import { lazyPlugin, lazy } from '@oxog/routely/plugins';

// Enable lazy loading
router.use(lazyPlugin({
  fallback: <Loading />,  // Optional global fallback
  timeout: 10000,         // Optional timeout (ms)
}));

// Define lazy routes
const routes = [
  route('/', Home),
  route('/dashboard', lazy(() => import('./Dashboard'))),
  route('/settings', lazy(() => import('./Settings'), {
    fallback: <SettingsLoader />,  // Route-specific fallback
  })),
];
```

### guardsPlugin

```typescript
import { guardsPlugin } from '@oxog/routely/plugins';

router.use(guardsPlugin({
  // Simple boolean guard
  '/admin': () => user.isAdmin,
  
  // Async guard
  '/profile': async () => {
    const session = await checkSession();
    return session.valid;
  },
  
  // Guard with redirect
  '/settings': {
    guard: () => isAuthenticated(),
    redirect: '/login',
  },
  
  // Wildcard patterns
  '/admin/*': () => user.isAdmin,
}));
```

### searchPlugin

```typescript
import { searchPlugin, useSearch } from '@oxog/routely/plugins';

router.use(searchPlugin({
  // Optional: parse/stringify customization
  parse: (search) => new URLSearchParams(search),
  stringify: (params) => params.toString(),
}));

// In components
function UserList() {
  const { search, setSearch } = useSearch<{
    page: number;
    sort: 'asc' | 'desc';
    filter?: string;
  }>();
  
  // Type-safe access
  console.log(search.page);  // number
  
  // Type-safe updates
  setSearch({ page: 2 });
  setSearch((prev) => ({ ...prev, page: prev.page + 1 }));
}
```

### scrollPlugin

```typescript
import { scrollPlugin } from '@oxog/routely/plugins';

router.use(scrollPlugin({
  // Restore scroll position on back/forward
  restoration: true,
  
  // Scroll to top on new navigation
  scrollToTop: true,
  
  // Custom scroll behavior
  behavior: 'smooth',
  
  // Exclude certain routes
  exclude: ['/modal/*'],
}));
```

### transitionPlugin

```typescript
import { transitionPlugin, useTransition } from '@oxog/routely/plugins';

router.use(transitionPlugin({
  duration: 300,
  type: 'fade', // 'fade' | 'slide' | 'none'
}));

// In components
function Layout() {
  const { isTransitioning, direction } = useTransition();
  
  return (
    <div className={isTransitioning ? 'transitioning' : ''}>
      <Outlet />
    </div>
  );
}
```

### breadcrumbPlugin

```typescript
import { breadcrumbPlugin, useBreadcrumbs } from '@oxog/routely/plugins';

router.use(breadcrumbPlugin({
  // Generate labels from route
  labelFn: (route) => route.meta?.title || route.path,
}));

// Define route metadata
const routes = [
  route('/', Home, { meta: { title: 'Home' } }),
  route('/users', Users, { meta: { title: 'Users' } }, [
    route(':id', UserDetail, { meta: { title: 'User Details' } }),
  ]),
];

// In components
function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  
  return (
    <nav>
      {breadcrumbs.map((crumb, i) => (
        <Link key={i} to={crumb.path}>{crumb.label}</Link>
      ))}
    </nav>
  );
}
```

### devtoolsPlugin

```typescript
import { devtoolsPlugin } from '@oxog/routely/plugins';

// Only in development
if (process.env.NODE_ENV === 'development') {
  router.use(devtoolsPlugin({
    position: 'bottom-right',
    collapsed: true,
  }));
}

// Features:
// - Route tree visualization
// - Navigation history
// - Current route details
// - Params inspector
// - Plugin list
```

---

## TYPE DEFINITIONS

```typescript
// Core types
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

export interface Router {
  readonly currentRoute: Route;
  readonly routes: RouteDefinition[];
  
  navigate(to: string | RouteRef, options?: NavigateOptions): void;
  back(): void;
  forward(): void;
  go(delta: number): void;
  
  use(plugin: RouterPlugin): Router;
  unregister(name: string): void;
  list(): string[];
  
  on(event: RouterEvent, handler: RouterEventHandler): () => void;
  off(event: RouterEvent, handler: RouterEventHandler): void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export type RouterEvent = 
  | 'beforeNavigate'
  | 'afterNavigate'
  | 'error';

// History types
export interface History {
  readonly location: Location;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  go(delta: number): void;
  back(): void;
  forward(): void;
  listen(listener: LocationListener): () => void;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

// Hook return types
export interface UseNavigateReturn {
  (to: string | RouteRef, options?: NavigateOptions): void;
  (delta: number): void;
}

export interface UseSearchReturn<T> {
  search: T;
  setSearch: (value: T | ((prev: T) => T)) => void;
}
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Universal (Browser + SSR) |
| Module Format | ESM only |
| Node.js Version | >= 18 |
| React Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 1.5KB gzipped |
| Bundle Size (react) | < 2.5KB gzipped (includes core) |
| Bundle Size (all plugins) | < 10KB gzipped |

---

## MCP SERVER

Create an MCP server for AI integration with three tools:

### Tool: routely_docs

Search and retrieve documentation.

```typescript
{
  name: 'routely_docs',
  description: 'Search Routely documentation',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (e.g., "useNavigate", "guards plugin")'
      },
      section: {
        type: 'string',
        enum: ['api', 'guides', 'plugins', 'examples'],
        description: 'Filter by documentation section'
      }
    },
    required: ['query']
  }
}
```

### Tool: routely_example

Fetch code examples.

```typescript
{
  name: 'routely_example',
  description: 'Get Routely code examples',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Example name (e.g., "auth-guards", "lazy-loading")'
      },
      category: {
        type: 'string',
        enum: ['basic', 'navigation', 'plugins', 'typescript', 'integrations', 'real-world'],
        description: 'Example category'
      }
    },
    required: ['name']
  }
}
```

### Tool: routely_migrate

Help migrate from other routers.

```typescript
{
  name: 'routely_migrate',
  description: 'Generate migration code from React Router or TanStack Router',
  inputSchema: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        enum: ['react-router', 'tanstack-router'],
        description: 'Source router library'
      },
      code: {
        type: 'string',
        description: 'Original router code to migrate'
      }
    },
    required: ['from', 'code']
  }
}
```

---

## LLM-NATIVE REQUIREMENTS

### llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

```markdown
# @oxog/routely

> The router that respects your bundle. Type-safe, extensible, tiny.

## Install

npm install @oxog/routely

## Basic Usage

import { createRouter, route, RouterProvider, Link, Outlet } from '@oxog/routely';

const router = createRouter({
  routes: [
    route('/', Home),
    route('/users', Users, [
      route(':id', UserDetail),
    ]),
  ],
});

function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <Outlet />
    </RouterProvider>
  );
}

## API Summary

### Router
- `createRouter(options)` - Create router instance
- `route(path, component, children?)` - Define route
- `router.use(plugin)` - Register plugin
- `router.navigate(to, options?)` - Navigate programmatically

### Hooks
- `useNavigate()` - Get navigate function
- `useParams<T>()` - Get route params
- `useRoute()` - Get current route
- `useSearch<T>()` - Get/set search params (requires searchPlugin)

### Components
- `<RouterProvider router={router}>` - Context provider
- `<Link to="/path">` - Navigation link
- `<Outlet />` - Nested route renderer

## Plugins

- `lazyPlugin` - Dynamic imports, code splitting
- `guardsPlugin` - Route protection, auth
- `searchPlugin` - Type-safe query params
- `scrollPlugin` - Scroll restoration
- `transitionPlugin` - Page transitions
- `breadcrumbPlugin` - Auto breadcrumbs
- `devtoolsPlugin` - Debug panel

## Type-Safe Routes

import { createRoutes } from '@oxog/routely';

const routes = createRoutes({
  users: {
    list: '/users',
    detail: '/users/:id',
  },
});

navigate(routes.users.detail, { id: '123' }); // ✅ Type-safe

## Common Patterns

### Protected Routes
router.use(guardsPlugin({
  '/admin/*': () => user.isAdmin,
}));

### Lazy Loading
route('/dashboard', lazy(() => import('./Dashboard')));

### Search Params
const { search, setSearch } = useSearch<{ page: number }>();

## Errors

| Code | Meaning | Solution |
|------|---------|----------|
| ROUTE_NOT_FOUND | No matching route | Check route definitions |
| GUARD_REJECTED | Navigation blocked by guard | Handle auth redirect |
| PLUGIN_ERROR | Plugin threw error | Check plugin config |

## Links

- Docs: https://routely.oxog.dev
- GitHub: https://github.com/ersinkoc/routely
```

### API Naming Standards

```typescript
// ✅ GOOD - Predictable patterns
createRouter()      // Factory
route()             // Builder
useNavigate()       // Hook
useParams()         // Hook
useRoute()          // Hook
useSearch()         // Hook
Link                // Component
Outlet              // Component
RouterProvider      // Provider

// ❌ BAD - Unpredictable
makeRouter()
defineRoute()
getNav()
Render()
```

### Example Organization (15+)

```
examples/
├── 01-basic/
│   ├── minimal/              # Simplest possible setup
│   ├── nested-routes/        # Parent/child routes
│   └── not-found/            # 404 handling
├── 02-navigation/
│   ├── programmatic/         # useNavigate usage
│   ├── link-active/          # Active link styling
│   └── params/               # Dynamic route params
├── 03-plugins/
│   ├── lazy-loading/         # Code splitting
│   ├── auth-guards/          # Protected routes
│   └── search-params/        # Query string management
├── 04-typescript/
│   ├── type-safe-routes/     # Full type safety demo
│   └── generic-params/       # Typed params
├── 05-integrations/
│   ├── react-query/          # Data fetching
│   ├── zustand/              # State management
│   └── framer-motion/        # Animations
└── 06-real-world/
    ├── dashboard/            # Admin panel
    ├── e-commerce/           # Product pages
    └── blog/                 # Content site
```

---

## WEBSITE SPECIFICATION

### Tech Stack
- React 18+ with TypeScript
- Vite for building
- Tailwind CSS for styling
- @oxog/codeshine for syntax highlighting
- Lucide React for icons

### Required Pages

1. **Home** (`/`)
   - Hero with tagline
   - Key features (tiny, type-safe, extensible)
   - Quick start code
   - Comparison table (vs TanStack, React Router)

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
- IDE-style code blocks (macOS traffic lights)
- Responsive design
- GitHub star button with real count
- Footer: "Made with ❤️ by Ersin KOÇ"
- CNAME: `routely.oxog.dev`

---

## CONFIG FILES

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'plugins/*'
  - 'mcp'
  - 'website'
```

### Root package.json

```json
{
  "name": "routely-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prettier": "^3.0.0"
  }
}
```

### packages/react/package.json

```json
{
  "name": "@oxog/routely",
  "version": "1.0.0",
  "description": "The router that respects your bundle. Type-safe, extensible, tiny.",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./plugins": {
      "import": {
        "types": "./dist/plugins.d.ts",
        "default": "./dist/plugins.js"
      },
      "require": {
        "types": "./dist/plugins.d.cts",
        "default": "./dist/plugins.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "react": ">=18.0.0"
  },
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

---

## GITHUB ACTIONS

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test:coverage
      
      - name: Build packages
        run: pnpm build
      
      - name: Build website
        working-directory: ./website
        run: pnpm build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### Core Package (@oxog/routely-core)
- [ ] Route matching algorithm
- [ ] Path parsing and param extraction
- [ ] History abstraction (browser, memory, hash)
- [ ] Route registry with type inference
- [ ] Event bus implementation
- [ ] Plugin system core
- [ ] 100% test coverage

### React Package (@oxog/routely)
- [ ] RouterProvider context
- [ ] useNavigate hook
- [ ] useParams hook
- [ ] useRoute hook
- [ ] Link component
- [ ] Outlet component
- [ ] 100% test coverage

### Plugins (each separately)
- [ ] lazyPlugin with Suspense
- [ ] guardsPlugin with redirect
- [ ] searchPlugin with type safety
- [ ] scrollPlugin with restoration
- [ ] transitionPlugin with CSS
- [ ] breadcrumbPlugin with meta
- [ ] devtoolsPlugin with UI
- [ ] 100% test coverage per plugin

### MCP Server
- [ ] routely_docs tool
- [ ] routely_example tool
- [ ] routely_migrate tool
- [ ] Server setup and testing

### LLM-Native
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README optimized for LLMs
- [ ] All public APIs have JSDoc + @example
- [ ] 15+ examples organized

### Website
- [ ] Home page with hero
- [ ] Documentation pages
- [ ] Examples showcase
- [ ] Plugin catalog
- [ ] Dark/Light theme
- [ ] Mobile responsive
- [ ] CNAME file

### Final Verification
- [ ] All tests passing (100%)
- [ ] Coverage at 100%
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] All packages build
- [ ] Website builds
- [ ] Examples all work

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm
- It must be production-ready
- Zero runtime dependencies (React is peerDependency)
- 100% test coverage
- Professionally documented
- LLM-native design
- Beautiful documentation website
- MCP server for AI integration
