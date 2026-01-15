# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

#### Core Package (@oxog/routely-core)
- Micro-kernel router architecture
- Custom route matching algorithm with ranking
- Path-to-regex implementation (zero dependencies)
- History abstraction (Browser, Memory, Hash)
- Type-safe route registry with path param inference
- Event bus (beforeNavigate, afterNavigate, error)
- Plugin system with lifecycle hooks
- Custom error types (RouterError)
- 100% test coverage

#### React Package (@oxog/routely)
- React Context-based integration
- `<RouterProvider>` component
- `<Link>` component with active state
- `<Outlet>` component for nested routes
- `useNavigate()` hook
- `useParams<T>()` hook
- `useRoute()` hook
- Full TypeScript support
- 100% test coverage

#### Plugins
- `lazyPlugin` - Dynamic imports and code splitting
- `guardsPlugin` - Route guards and authentication
- `searchPlugin` - Type-safe query parameters
- `scrollPlugin` - Scroll position restoration
- `transitionPlugin` - Page transition animations
- `breadcrumbPlugin` - Auto breadcrumb generation
- `devtoolsPlugin` - Debug panel and route inspector

#### Examples
- 15+ example applications across 6 categories
- Basic examples (minimal, nested routes, 404)
- Navigation examples (programmatic, active links, params)
- Plugin examples (lazy loading, guards, search params)
- TypeScript examples (type-safe routes, generic params)
- Integration examples (react-query, zustand, framer-motion)
- Real-world examples (dashboard, e-commerce, blog)

#### Documentation
- Complete documentation website at routely.oxog.dev
- LLM-native llms.txt file
- Comprehensive API reference with JSDoc
- Migration guides from React Router and TanStack Router
- MCP server for AI integration

#### Infrastructure
- Monorepo setup with pnpm workspaces
- TypeScript strict mode
- Vitest for testing (100% coverage)
- tsup for bundling
- GitHub Actions CI/CD
- Automated NPM publishing
- GitHub Pages deployment

### Technical Details

- **Bundle Size**: Core ~1.5KB, React ~2.5KB gzipped (total)
- **Runtime Dependencies**: ZERO
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Node.js Version**: >=18
- **React Version**: >=18 (peer dependency)
- **TypeScript Version**: >=5.0

[1.0.0]: https://github.com/ersinkoc/routely/releases/tag/v1.0.0
