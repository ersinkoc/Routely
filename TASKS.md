# @oxog/routely - Task List

This document contains the ordered, numbered task list for implementing the entire Routely package. Each task must be completed sequentially.

## Phase 1: Project Setup (Tasks 1-10)

### Task 1: Initialize Root Workspace
- [ ] Create root `package.json` with workspace configuration
- [ ] Create `pnpm-workspace.yaml`
- [ ] Create root `.gitignore`
- [ ] Create root `tsconfig.json` (base configuration)
- [ ] Install pnpm globally if needed
- [ ] Initialize git repository

### Task 2: Setup Core Package Structure
- [ ] Create `packages/core/` directory
- [ ] Create `packages/core/package.json`
- [ ] Create `packages/core/tsconfig.json`
- [ ] Create `packages/core/tsup.config.ts`
- [ ] Create `packages/core/vitest.config.ts`
- [ ] Create `packages/core/src/` directory
- [ ] Create `packages/core/tests/` directory

### Task 3: Setup React Package Structure
- [ ] Create `packages/react/` directory
- [ ] Create `packages/react/package.json`
- [ ] Create `packages/react/tsconfig.json`
- [ ] Create `packages/react/tsup.config.ts`
- [ ] Create `packages/react/vitest.config.ts`
- [ ] Create `packages/react/src/` directory
- [ ] Create `packages/react/tests/` directory

### Task 4: Setup Plugin Directories
- [ ] Create `plugins/` directory
- [ ] Create `plugins/lazy/` with package.json
- [ ] Create `plugins/guards/` with package.json
- [ ] Create `plugins/search/` with package.json
- [ ] Create `plugins/scroll/` with package.json
- [ ] Create `plugins/transition/` with package.json
- [ ] Create `plugins/breadcrumb/` with package.json
- [ ] Create `plugins/devtools/` with package.json

### Task 5: Setup Examples Directory
- [ ] Create `examples/` directory
- [ ] Create subdirectories for each category (01-basic, 02-navigation, etc.)
- [ ] Create placeholder README.md in each category

### Task 6: Setup Website Directory
- [ ] Create `website/` directory
- [ ] Create `website/package.json`
- [ ] Create `website/vite.config.ts`
- [ ] Create `website/tsconfig.json`
- [ ] Create `website/public/` directory
- [ ] Create `website/src/` directory

### Task 7: Setup MCP Server Directory
- [ ] Create `mcp/` directory
- [ ] Create `mcp/package.json`
- [ ] Create `mcp/tsconfig.json`
- [ ] Create `mcp/src/` directory
- [ ] Create `mcp/src/tools/` directory

### Task 8: Install Root Dependencies
- [ ] Run `pnpm install -w typescript@^5.0.0 -D`
- [ ] Run `pnpm install -w prettier@^3.0.0 -D`
- [ ] Run `pnpm install -w vitest@^2.0.0 -D`
- [ ] Run `pnpm install -w @vitest/coverage-v8@^2.0.0 -D`
- [ ] Run `pnpm install -w tsup@^8.0.0 -D`
- [ ] Run `pnpm install -w @types/node@^20.0.0 -D`

### Task 9: Create Root Configuration Files
- [ ] Create `.prettierrc` with formatting rules
- [ ] Create `.eslintrc.json` (optional, for code quality)
- [ ] Create `.editorconfig` for consistent editor settings
- [ ] Create `LICENSE` file (MIT)
- [ ] Create root `README.md` with project overview

### Task 10: Verify Project Structure
- [ ] Run `pnpm install` to verify workspace setup
- [ ] Verify all package.json files are valid
- [ ] Verify TypeScript configurations are valid
- [ ] Commit initial project structure

## Phase 2: Core Package Implementation (Tasks 11-30)

### Task 11: Implement Core Types
- [ ] Create `packages/core/src/types.ts`
- [ ] Define `Route` interface
- [ ] Define `RouteDefinition` interface
- [ ] Define `RouterOptions` interface
- [ ] Define `History` interface
- [ ] Define `Location` interface
- [ ] Define `RouterEvent` type
- [ ] Define `RouterPlugin` interface
- [ ] Define `NavigateOptions` interface
- [ ] Export all types from `types.ts`

### Task 12: Implement Custom Errors
- [ ] Create `packages/core/src/errors.ts`
- [ ] Implement `RouterError` class
- [ ] Implement `createNotFoundError()` function
- [ ] Implement `createGuardError()` function
- [ ] Implement `createPluginError()` function
- [ ] Export all error functions

### Task 13: Implement Utility Functions
- [ ] Create `packages/core/src/utils.ts`
- [ ] Implement `parsePath()` - Parse URL into components
- [ ] Implement `joinPaths()` - Join path segments
- [ ] Implement `normalizeSlashes()` - Normalize slashes in paths
- [ ] Implement `parseSearch()` - Parse query string
- [ ] Implement `stringifySearch()` - Stringify query params
- [ ] Write unit tests for all utilities

### Task 14: Implement Route Matcher
- [ ] Create `packages/core/src/matcher.ts`
- [ ] Implement `pathToRegex()` - Convert path to regex
- [ ] Implement `extractParams()` - Extract params from URL
- [ ] Implement `calculateScore()` - Calculate route specificity
- [ ] Implement `rankRoutes()` - Sort routes by priority
- [ ] Implement `matchRoute()` - Match URL against routes
- [ ] Create `RouteMatcher` class with caching
- [ ] Write comprehensive unit tests

### Task 15: Test Route Matcher
- [ ] Create `packages/core/tests/matcher.test.ts`
- [ ] Test static route matching
- [ ] Test dynamic param matching (:id)
- [ ] Test optional segments (:id?)
- [ ] Test wildcard matching (*)
- [ ] Test nested routes
- [ ] Test route ranking/priority
- [ ] Test param extraction
- [ ] Verify 100% coverage

### Task 16: Implement BrowserHistory
- [ ] Create `packages/core/src/history.ts`
- [ ] Implement `createBrowserHistory()` function
- [ ] Implement `push()` method
- [ ] Implement `replace()` method
- [ ] Implement `go()`, `back()`, `forward()` methods
- [ ] Implement `listen()` for location changes
- [ ] Handle popstate events
- [ ] Export BrowserHistory

### Task 17: Implement MemoryHistory
- [ ] Implement `createMemoryHistory()` in `history.ts`
- [ ] Manage in-memory entries stack
- [ ] Implement `push()` method
- [ ] Implement `replace()` method
- [ ] Implement `go()`, `back()`, `forward()` methods
- [ ] Implement `listen()` for location changes
- [ ] Handle out-of-bounds navigation
- [ ] Export MemoryHistory

### Task 18: Implement HashHistory
- [ ] Implement `createHashHistory()` in `history.ts`
- [ ] Use `window.location.hash` for routing
- [ ] Implement `push()` method
- [ ] Implement `replace()` method
- [ ] Implement `go()`, `back()`, `forward()` methods
- [ ] Listen to hashchange events
- [ ] Export HashHistory

### Task 19: Test History Implementations
- [ ] Create `packages/core/tests/history.test.ts`
- [ ] Test BrowserHistory push/replace/go
- [ ] Test BrowserHistory listeners
- [ ] Test MemoryHistory with initial entries
- [ ] Test MemoryHistory navigation bounds
- [ ] Test HashHistory hash changes
- [ ] Test listener cleanup
- [ ] Verify 100% coverage

### Task 20: Implement Type-Safe Registry
- [ ] Create `packages/core/src/registry.ts`
- [ ] Implement `createRoutes()` function with Proxy
- [ ] Implement `createRouteRef()` for individual routes
- [ ] Implement `ExtractParams<T>` type helper
- [ ] Implement `TypedRoutes<T>` type helper
- [ ] Implement `.build()` method for param substitution
- [ ] Export registry functions and types

### Task 21: Test Type-Safe Registry
- [ ] Create `packages/core/tests/registry.test.ts`
- [ ] Test route registry creation
- [ ] Test nested route access
- [ ] Test param extraction
- [ ] Test build() method with params
- [ ] Test TypeScript type inference (snapshot tests)
- [ ] Verify 100% coverage

### Task 22: Implement Router Kernel
- [ ] Create `packages/core/src/kernel.ts`
- [ ] Implement `RouterKernel` class
- [ ] Implement event emitter (on/off methods)
- [ ] Implement plugin registry (use/unregister/list)
- [ ] Implement navigate() method
- [ ] Implement back(), forward(), go() methods
- [ ] Implement route matching integration
- [ ] Handle navigation errors

### Task 23: Implement Plugin Lifecycle
- [ ] Add plugin installation in kernel
- [ ] Call plugin.install() on registration
- [ ] Call plugin.onInit() after router ready
- [ ] Call plugin.onBeforeNavigate() before navigation
- [ ] Call plugin.onAfterNavigate() after navigation
- [ ] Call plugin.onDestroy() on unregister
- [ ] Handle plugin errors with plugin.onError()
- [ ] Implement dependency checking

### Task 24: Test Router Kernel
- [ ] Create `packages/core/tests/kernel.test.ts`
- [ ] Test kernel initialization
- [ ] Test event emitter (on/off/emit)
- [ ] Test plugin registration
- [ ] Test plugin lifecycle hooks
- [ ] Test plugin dependencies
- [ ] Test error handling
- [ ] Verify 100% coverage

### Task 25: Implement Router Factory
- [ ] Create `packages/core/src/router.ts`
- [ ] Implement `createRouter()` function
- [ ] Accept RouterOptions (routes, history, basePath)
- [ ] Initialize RouterKernel
- [ ] Set up default history (BrowserHistory)
- [ ] Process nested routes (flatten hierarchy)
- [ ] Validate routes
- [ ] Return Router instance

### Task 26: Implement route() Helper
- [ ] Create `route()` function in `router.ts`
- [ ] Accept path, component, children, meta
- [ ] Return RouteDefinition object
- [ ] Support nested routes
- [ ] Validate route path
- [ ] Export route() function

### Task 27: Test Router Factory
- [ ] Create `packages/core/tests/router.test.ts`
- [ ] Test createRouter() with minimal config
- [ ] Test createRouter() with custom history
- [ ] Test createRouter() with basePath
- [ ] Test route() helper function
- [ ] Test nested route processing
- [ ] Test route validation
- [ ] Verify 100% coverage

### Task 28: Create Core Package Index
- [ ] Create `packages/core/src/index.ts`
- [ ] Export all types from `types.ts`
- [ ] Export all errors from `errors.ts`
- [ ] Export `createRouter`, `route` from `router.ts`
- [ ] Export history creators from `history.ts`
- [ ] Export `createRoutes` from `registry.ts`
- [ ] Export matcher utilities (if needed)
- [ ] Verify all exports are type-safe

### Task 29: Build Core Package
- [ ] Run `pnpm build` in packages/core
- [ ] Verify dist/index.js (ESM) is created
- [ ] Verify dist/index.cjs (CommonJS) is created
- [ ] Verify dist/index.d.ts (types) is created
- [ ] Check bundle size (< 1.5KB gzipped)
- [ ] Fix any build errors

### Task 30: Run Core Package Tests
- [ ] Run `pnpm test` in packages/core
- [ ] Verify all tests pass
- [ ] Run `pnpm test:coverage` in packages/core
- [ ] Verify 100% coverage (branches, functions, lines, statements)
- [ ] Fix any failing tests or coverage gaps

## Phase 3: React Package Implementation (Tasks 31-45)

### Task 31: Install React Dependencies
- [ ] Install `react@^18.0.0` as peerDependency in packages/react
- [ ] Install `react@^18.0.0` as devDependency for testing
- [ ] Install `@types/react@^18.0.0` as devDependency
- [ ] Install `@testing-library/react` as devDependency
- [ ] Install `@testing-library/jest-dom` as devDependency
- [ ] Install `jsdom` for Vitest

### Task 32: Implement React Types
- [ ] Create `packages/react/src/types.ts`
- [ ] Define `RouterProviderProps` interface
- [ ] Define `LinkProps` interface
- [ ] Define `NavigateFunction` type
- [ ] Define `UseNavigateReturn` type
- [ ] Define `UseSearchReturn<T>` interface
- [ ] Export all React-specific types

### Task 33: Implement Router Context
- [ ] Create `packages/react/src/context.ts`
- [ ] Define `RouterContextValue` interface
- [ ] Create `RouterContext` with React.createContext
- [ ] Implement `useRouterContext()` hook
- [ ] Add error handling for context not found
- [ ] Export context and hook

### Task 34: Implement RouterProvider
- [ ] Create `packages/react/src/provider.ts`
- [ ] Implement `RouterProvider` component
- [ ] Use `useState` for current route
- [ ] Subscribe to router events in `useEffect`
- [ ] Provide context value with `useMemo`
- [ ] Clean up subscriptions on unmount
- [ ] Export RouterProvider

### Task 35: Test RouterProvider
- [ ] Create `packages/react/tests/provider.test.tsx`
- [ ] Test RouterProvider renders children
- [ ] Test context value is provided
- [ ] Test re-renders on route change
- [ ] Test cleanup on unmount
- [ ] Verify 100% coverage

### Task 36: Implement useNavigate Hook
- [ ] Create `packages/react/src/hooks.ts`
- [ ] Implement `useNavigate()` hook
- [ ] Return navigate function with `useCallback`
- [ ] Handle string paths
- [ ] Handle numeric delta (back/forward)
- [ ] Handle RouteRef objects
- [ ] Support NavigateOptions

### Task 37: Implement useParams Hook
- [ ] Implement `useParams<T>()` in `hooks.ts`
- [ ] Get current route from context
- [ ] Return typed params object
- [ ] Support generic type parameter

### Task 38: Implement useRoute Hook
- [ ] Implement `useRoute()` in `hooks.ts`
- [ ] Get current route from context
- [ ] Return complete Route object

### Task 39: Test React Hooks
- [ ] Create `packages/react/tests/hooks.test.tsx`
- [ ] Test useNavigate() with strings
- [ ] Test useNavigate() with numbers
- [ ] Test useNavigate() with RouteRef
- [ ] Test useParams() returns correct params
- [ ] Test useRoute() returns current route
- [ ] Verify 100% coverage

### Task 40: Implement Link Component
- [ ] Create `packages/react/src/components.ts`
- [ ] Implement `Link` component
- [ ] Accept `to`, `activeClassName`, `replace`, `state` props
- [ ] Detect active state
- [ ] Handle click to prevent default and navigate
- [ ] Pass through other props to `<a>`
- [ ] Export Link

### Task 41: Implement Outlet Component
- [ ] Implement `Outlet` component in `components.ts`
- [ ] Get current route from context
- [ ] Find matched route definition
- [ ] Render matched component
- [ ] Handle no match case
- [ ] Export Outlet

### Task 42: Test React Components
- [ ] Create `packages/react/tests/components.test.tsx`
- [ ] Test Link renders anchor tag
- [ ] Test Link handles click events
- [ ] Test Link applies activeClassName
- [ ] Test Link passes props to anchor
- [ ] Test Outlet renders matched component
- [ ] Test Outlet handles no match
- [ ] Verify 100% coverage

### Task 43: Create React Package Index
- [ ] Create `packages/react/src/index.ts`
- [ ] Re-export everything from @oxog/routely-core
- [ ] Export RouterProvider from `provider.ts`
- [ ] Export all hooks from `hooks.ts`
- [ ] Export all components from `components.ts`
- [ ] Export all React types from `types.ts`
- [ ] Create `plugins.ts` entry (empty for now)

### Task 44: Build React Package
- [ ] Run `pnpm build` in packages/react
- [ ] Verify dist/index.js (ESM) is created
- [ ] Verify dist/index.cjs (CommonJS) is created
- [ ] Verify dist/index.d.ts (types) is created
- [ ] Verify dist/plugins.js is created
- [ ] Check bundle size (< 2.5KB gzipped total)
- [ ] Fix any build errors

### Task 45: Run React Package Tests
- [ ] Run `pnpm test` in packages/react
- [ ] Verify all tests pass
- [ ] Run `pnpm test:coverage` in packages/react
- [ ] Verify 100% coverage
- [ ] Fix any failing tests or coverage gaps

## Phase 4: Plugin Implementation (Tasks 46-70)

### Task 46-50: Implement lazyPlugin
- [ ] Create `plugins/lazy/src/index.ts`
- [ ] Implement `LazyPluginOptions` interface
- [ ] Implement `lazyPlugin()` factory function
- [ ] Implement plugin lifecycle hooks
- [ ] Implement `lazy()` wrapper with React.lazy
- [ ] Integrate with React Suspense
- [ ] Handle timeout option
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 800B gzipped)
- [ ] Achieve 100% test coverage

### Task 51-55: Implement guardsPlugin
- [ ] Create `plugins/guards/src/index.ts`
- [ ] Implement `Guard` and `GuardConfig` types
- [ ] Implement `guardsPlugin()` factory function
- [ ] Implement pattern matching for guards
- [ ] Implement sync and async guard execution
- [ ] Implement redirect on guard failure
- [ ] Handle wildcard patterns
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 800B gzipped)
- [ ] Achieve 100% test coverage

### Task 56-60: Implement searchPlugin
- [ ] Create `plugins/search/src/index.ts`
- [ ] Implement `SearchPluginOptions` interface
- [ ] Implement `searchPlugin()` factory function
- [ ] Implement `useSearch<T>()` hook
- [ ] Implement parse/stringify customization
- [ ] Implement type-safe search params
- [ ] Implement `setSearch()` with updater function
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 800B gzipped)
- [ ] Achieve 100% test coverage

### Task 61-63: Implement scrollPlugin
- [ ] Create `plugins/scroll/src/index.ts`
- [ ] Implement `ScrollPluginOptions` interface
- [ ] Implement `scrollPlugin()` factory function
- [ ] Implement scroll restoration on back/forward
- [ ] Implement scroll to top on new navigation
- [ ] Implement route exclusion patterns
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 600B gzipped)
- [ ] Achieve 100% test coverage

### Task 64-66: Implement transitionPlugin
- [ ] Create `plugins/transition/src/index.ts`
- [ ] Implement `TransitionPluginOptions` interface
- [ ] Implement `transitionPlugin()` factory function
- [ ] Implement `useTransition()` hook
- [ ] Implement transition states (entering/leaving)
- [ ] Support fade/slide/custom transitions
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 800B gzipped)
- [ ] Achieve 100% test coverage

### Task 67-69: Implement breadcrumbPlugin
- [ ] Create `plugins/breadcrumb/src/index.ts`
- [ ] Implement `BreadcrumbPluginOptions` interface
- [ ] Implement `breadcrumbPlugin()` factory function
- [ ] Implement `useBreadcrumbs()` hook
- [ ] Generate breadcrumbs from route hierarchy
- [ ] Support custom label function
- [ ] Write comprehensive tests
- [ ] Build and verify bundle size (< 600B gzipped)
- [ ] Achieve 100% test coverage

### Task 70: Implement devtoolsPlugin (Basic)
- [ ] Create `plugins/devtools/src/index.ts`
- [ ] Implement `DevtoolsPluginOptions` interface
- [ ] Implement `devtoolsPlugin()` factory function
- [ ] Create basic UI component (React)
- [ ] Display current route info
- [ ] Display navigation history
- [ ] Display plugin list
- [ ] Build and verify bundle size (< 4KB gzipped)
- [ ] Write basic tests (partial coverage OK for UI)

## Phase 5: Examples (Tasks 71-85)

### Task 71-73: Basic Examples
- [ ] Create `examples/01-basic/minimal/` - Simplest setup
- [ ] Create `examples/01-basic/nested-routes/` - Parent/child routes
- [ ] Create `examples/01-basic/not-found/` - 404 handling

### Task 74-76: Navigation Examples
- [ ] Create `examples/02-navigation/programmatic/` - useNavigate usage
- [ ] Create `examples/02-navigation/link-active/` - Active link styling
- [ ] Create `examples/02-navigation/params/` - Dynamic route params

### Task 77-79: Plugin Examples
- [ ] Create `examples/03-plugins/lazy-loading/` - Code splitting
- [ ] Create `examples/03-plugins/auth-guards/` - Protected routes
- [ ] Create `examples/03-plugins/search-params/` - Query string management

### Task 80-81: TypeScript Examples
- [ ] Create `examples/04-typescript/type-safe-routes/` - Full type safety demo
- [ ] Create `examples/04-typescript/generic-params/` - Typed params

### Task 82-84: Integration Examples
- [ ] Create `examples/05-integrations/react-query/` - Data fetching
- [ ] Create `examples/05-integrations/zustand/` - State management
- [ ] Create `examples/05-integrations/framer-motion/` - Animations

### Task 85: Real-World Examples
- [ ] Create `examples/06-real-world/dashboard/` - Admin panel
- [ ] Create `examples/06-real-world/e-commerce/` - Product pages
- [ ] Create `examples/06-real-world/blog/` - Content site

## Phase 6: MCP Server (Tasks 86-90)

### Task 86: Setup MCP Server
- [ ] Install MCP SDK dependencies
- [ ] Create `mcp/src/index.ts`
- [ ] Create `mcp/src/server.ts`
- [ ] Initialize MCP server instance
- [ ] Export server

### Task 87: Implement routely_docs Tool
- [ ] Create `mcp/src/tools/docs.ts`
- [ ] Define tool schema
- [ ] Implement documentation search logic
- [ ] Read and index documentation files
- [ ] Filter by section (api/guides/plugins/examples)
- [ ] Return matching documentation

### Task 88: Implement routely_example Tool
- [ ] Create `mcp/src/tools/example.ts`
- [ ] Define tool schema
- [ ] Implement example fetching logic
- [ ] Read example files by name/category
- [ ] Return complete example code

### Task 89: Implement routely_migrate Tool
- [ ] Create `mcp/src/tools/migrate.ts`
- [ ] Define tool schema
- [ ] Implement migration from React Router
- [ ] Implement migration from TanStack Router
- [ ] Parse original code
- [ ] Generate Routely equivalent code

### Task 90: Test and Build MCP Server
- [ ] Write tests for each tool
- [ ] Test MCP server initialization
- [ ] Build MCP server
- [ ] Verify server runs correctly
- [ ] Create usage documentation

## Phase 7: LLM-Native Features (Tasks 91-95)

### Task 91: Create llms.txt
- [ ] Create `/llms.txt` in root
- [ ] Add project description
- [ ] Add installation instructions
- [ ] Add basic usage examples
- [ ] Add API summary
- [ ] Add plugin list
- [ ] Add common patterns
- [ ] Add error codes reference
- [ ] Add links (docs, GitHub)
- [ ] Verify < 2000 tokens

### Task 92: Copy llms.txt to Website
- [ ] Copy `llms.txt` to `website/public/llms.txt`
- [ ] Verify file is accessible at /llms.txt

### Task 93: Add JSDoc to All Public APIs
- [ ] Add JSDoc to all exported functions in core
- [ ] Add JSDoc to all exported functions in React
- [ ] Add JSDoc to all plugin functions
- [ ] Add @example to every public API
- [ ] Add @param and @returns to all functions
- [ ] Verify TypeScript IntelliSense works

### Task 94: Optimize README for LLMs
- [ ] Add clear project description
- [ ] Add quick start (< 50 lines)
- [ ] Add features overview
- [ ] Add API reference (brief)
- [ ] Add plugin catalog
- [ ] Add examples link
- [ ] Add predictable API naming
- [ ] Verify structure is LLM-friendly

### Task 95: Verify LLM-Native Design
- [ ] Verify all APIs use predictable naming (create*, use*, etc.)
- [ ] Verify 15+ examples exist
- [ ] Verify llms.txt is complete
- [ ] Verify JSDoc coverage is 100%
- [ ] Test with LLM assistant (if possible)

## Phase 8: Website (Tasks 96-110)

### Task 96: Setup Website Dependencies
- [ ] Install React, TypeScript, Vite
- [ ] Install Tailwind CSS
- [ ] Install @oxog/codeshine
- [ ] Install lucide-react
- [ ] Configure Vite
- [ ] Configure Tailwind

### Task 97: Create Website Layout
- [ ] Create `website/src/App.tsx`
- [ ] Create header component with navigation
- [ ] Create footer component
- [ ] Create theme toggle (dark/light)
- [ ] Create responsive layout
- [ ] Style with Tailwind

### Task 98-100: Create Home Page
- [ ] Create hero section with tagline
- [ ] Create feature highlights (tiny, type-safe, extensible)
- [ ] Create quick start code block
- [ ] Create comparison table (vs TanStack, React Router)
- [ ] Add GitHub star button
- [ ] Make responsive

### Task 101-103: Create Documentation Pages
- [ ] Create Getting Started page
- [ ] Create Core Concepts page
- [ ] Create API Reference page
- [ ] Create Plugins Guide page
- [ ] Add syntax highlighting with @oxog/codeshine
- [ ] Add IDE-style code blocks

### Task 104-105: Create Examples Page
- [ ] Create examples showcase
- [ ] Display all 15+ examples
- [ ] Add CodeSandbox links
- [ ] Add category filters
- [ ] Make interactive

### Task 106-107: Create Plugins Page
- [ ] Create plugin catalog
- [ ] Display all plugins with descriptions
- [ ] Add installation instructions
- [ ] Add usage examples
- [ ] Link to plugin documentation

### Task 108: Setup Routing for Website
- [ ] Use @oxog/routely for website routing (dogfooding!)
- [ ] Define routes for all pages
- [ ] Add not found page
- [ ] Test navigation

### Task 109: Add CNAME File
- [ ] Create `website/public/CNAME`
- [ ] Add `routely.oxog.dev` to CNAME

### Task 110: Build and Test Website
- [ ] Run `pnpm build` in website
- [ ] Verify build output
- [ ] Test all pages
- [ ] Test responsive design
- [ ] Test theme toggle
- [ ] Fix any issues

## Phase 9: Configuration and CI/CD (Tasks 111-120)

### Task 111: Create Root README.md
- [ ] Write project overview
- [ ] Add quick start guide
- [ ] Add monorepo structure explanation
- [ ] Add links to packages
- [ ] Add contributing section (none - solo project)
- [ ] Add license info
- [ ] Add author info

### Task 112: Create CHANGELOG.md
- [ ] Create CHANGELOG.md in root
- [ ] Add v1.0.0 initial release notes
- [ ] List all features
- [ ] Follow Keep a Changelog format

### Task 113: Create LICENSE
- [ ] Create MIT LICENSE file
- [ ] Add copyright: Ersin Koç
- [ ] Add year: 2024

### Task 114: Update All package.json Files
- [ ] Verify all package.json have correct metadata
- [ ] Verify keywords in React package
- [ ] Verify repository URLs
- [ ] Verify author field
- [ ] Verify license field
- [ ] Verify homepage field

### Task 115: Create .github/workflows/test.yml
- [ ] Create CI workflow for testing
- [ ] Run tests on push/PR
- [ ] Run coverage checks
- [ ] Enforce 100% coverage
- [ ] Test on multiple Node versions (18, 20, 21)

### Task 116: Create .github/workflows/deploy.yml
- [ ] Create deployment workflow for website
- [ ] Trigger on push to main
- [ ] Install dependencies
- [ ] Run tests
- [ ] Build packages
- [ ] Build website
- [ ] Deploy to GitHub Pages
- [ ] Configure GitHub Pages settings

### Task 117: Create .github/workflows/publish.yml
- [ ] Create NPM publish workflow
- [ ] Trigger on release tag
- [ ] Build all packages
- [ ] Run all tests
- [ ] Publish to NPM with --access public
- [ ] Publish core package
- [ ] Publish React package

### Task 118: Create Root Scripts
- [ ] Add `pnpm build` script (build all packages)
- [ ] Add `pnpm test` script (test all packages)
- [ ] Add `pnpm test:coverage` script
- [ ] Add `pnpm lint` script
- [ ] Add `pnpm typecheck` script
- [ ] Add `pnpm clean` script

### Task 119: Setup Git Hooks (Optional)
- [ ] Install husky (optional)
- [ ] Add pre-commit hook for linting
- [ ] Add pre-push hook for tests
- [ ] Configure git hooks

### Task 120: Create .nvmrc
- [ ] Create .nvmrc file
- [ ] Set Node version to 20

## Phase 10: Final Verification (Tasks 121-130)

### Task 121: Run All Tests
- [ ] Run `pnpm test` in root
- [ ] Verify all tests pass in core package
- [ ] Verify all tests pass in React package
- [ ] Verify all tests pass in all plugins
- [ ] Fix any failing tests

### Task 122: Check Test Coverage
- [ ] Run `pnpm test:coverage` in root
- [ ] Verify core package has 100% coverage
- [ ] Verify React package has 100% coverage
- [ ] Verify all plugins have 100% coverage
- [ ] Fix any coverage gaps

### Task 123: Check TypeScript
- [ ] Run `pnpm typecheck` in root
- [ ] Verify no TypeScript errors in core
- [ ] Verify no TypeScript errors in React
- [ ] Verify no TypeScript errors in plugins
- [ ] Verify no TypeScript errors in website
- [ ] Fix any type errors

### Task 124: Check Bundle Sizes
- [ ] Build all packages
- [ ] Check core package size (< 1.5KB gzipped)
- [ ] Check React package size (< 2.5KB gzipped total)
- [ ] Check each plugin size (< 800B gzipped each)
- [ ] Check total size with all plugins (< 10KB gzipped)
- [ ] Optimize if needed

### Task 125: Verify Zero Dependencies
- [ ] Check packages/core/package.json dependencies: {}
- [ ] Check packages/react/package.json dependencies: {} (react is peerDep)
- [ ] Check all plugin package.json dependencies: {}
- [ ] Verify no accidental dependencies added
- [ ] Fix if any dependencies found

### Task 126: Test All Examples
- [ ] Run each example application
- [ ] Verify all 15+ examples work
- [ ] Verify no errors in console
- [ ] Test navigation in each example
- [ ] Fix any broken examples

### Task 127: Verify Documentation
- [ ] Review README.md
- [ ] Review llms.txt
- [ ] Review all JSDoc comments
- [ ] Review website documentation
- [ ] Fix any documentation issues
- [ ] Check for typos and clarity

### Task 128: Performance Testing
- [ ] Run route matching benchmark (1000 routes)
- [ ] Verify < 1ms for route matching
- [ ] Run navigation benchmark
- [ ] Verify < 5ms for client-side navigation
- [ ] Run initial render benchmark
- [ ] Verify < 10ms for initial render

### Task 129: Browser Compatibility Testing
- [ ] Test in Chrome 90+
- [ ] Test in Firefox 88+
- [ ] Test in Safari 14+
- [ ] Test in Edge 90+
- [ ] Fix any compatibility issues

### Task 130: Final Checklist
- [ ] ✅ Zero runtime dependencies
- [ ] ✅ 100% test coverage
- [ ] ✅ < 2.5KB gzipped (core + React)
- [ ] ✅ Full TypeScript support
- [ ] ✅ Plugin system working
- [ ] ✅ 15+ examples complete
- [ ] ✅ Complete documentation
- [ ] ✅ MCP server functional
- [ ] ✅ llms.txt created
- [ ] ✅ Website deployed
- [ ] ✅ All tests passing
- [ ] ✅ Production ready

---

## Implementation Notes

**Sequential Execution:**
- Tasks must be completed in order (1 → 130)
- Each task builds on previous tasks
- Do not skip tasks

**Testing Requirements:**
- Every code task requires tests
- 100% coverage is mandatory
- All tests must pass

**Zero Dependencies:**
- NEVER add runtime dependencies
- Implement everything from scratch
- Only devDependencies allowed (TypeScript, Vitest, etc.)

**Quality Standards:**
- TypeScript strict mode enabled
- No `any` types allowed
- Full JSDoc on public APIs
- Clean, readable code

**Progress Tracking:**
- Mark [ ] as [x] when complete
- Document any blockers or issues
- Commit after each major task group

---

**Total Tasks: 130**

**Estimated Completion: Following this task list will result in a complete, production-ready, zero-dependency router package.**
