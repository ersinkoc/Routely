# @oxog/routely

> The router that respects your bundle. Type-safe, extensible, tiny.

[![npm version](https://img.shields.io/npm/v/@oxog/routely.svg)](https://www.npmjs.com/package/@oxog/routely)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@oxog/routely)](https://bundlephobia.com/package/@oxog/routely)
[![license](https://img.shields.io/npm/l/@oxog/routely.svg)](https://github.com/ersinkoc/routely/blob/main/LICENSE)

Routely is a micro-kernel based router for React applications that prioritizes bundle size, type safety, and extensibility. With a framework-agnostic core (~1.5KB) and React adapter (~2.5KB total), it provides everything you need for modern SPA and SSR routing without the bloat.

## Features

- **🪶 Tiny Bundle**: Core ~1.5KB, React adapter ~2.5KB gzipped
- **🔒 Type-Safe**: Full TypeScript support with type inference
- **🔌 Extensible**: Plugin-based architecture, pay only for what you use
- **⚡ Zero Dependencies**: No runtime dependencies whatsoever
- **🎯 Simple API**: Predictable, LLM-friendly API design
- **🧪 100% Tested**: Complete test coverage

## Quick Start

```bash
npm install @oxog/routely
```

```tsx
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
      <main>
        <Outlet />
      </main>
    </RouterProvider>
  );
}
```

## Documentation

Full documentation is available at [routely.oxog.dev](https://routely.oxog.dev)

## Packages

This monorepo contains:

- **[@oxog/routely](./packages/react)** - Main package with React bindings
- **[@oxog/routely-core](./packages/core)** - Framework-agnostic core
- **[plugins](./plugins)** - Optional feature plugins
- **[examples](./examples)** - 15+ example applications
- **[website](./website)** - Documentation site
- **[mcp](./mcp)** - MCP server for AI integration

## Plugin Ecosystem

- **lazyPlugin** - Dynamic imports, code splitting
- **guardsPlugin** - Route protection, authentication
- **searchPlugin** - Type-safe query params
- **scrollPlugin** - Scroll position restoration
- **transitionPlugin** - Page transition animations
- **breadcrumbPlugin** - Auto breadcrumb generation
- **devtoolsPlugin** - Debug panel, route inspector

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck
```

## Monorepo Structure

```
routely/
├── packages/
│   ├── core/                 # @oxog/routely-core
│   └── react/                # @oxog/routely
├── plugins/                  # Optional plugins
├── examples/                 # 15+ examples
├── website/                  # Documentation site
└── mcp/                      # MCP server
```

## License

MIT © [Ersin Koç](https://github.com/ersinkoc)

## Links

- [Documentation](https://routely.oxog.dev)
- [GitHub Repository](https://github.com/ersinkoc/routely)
- [NPM Package](https://www.npmjs.com/package/@oxog/routely)
- [LLMs.txt](./llms.txt)
