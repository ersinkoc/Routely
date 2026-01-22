# @oxog/routely

> Type-safe, extensible router that respects your bundle size.

[![npm version](https://img.shields.io/npm/v/@oxog/routely.svg)](https://www.npmjs.com/package/@oxog/routely)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@oxog/routely)](https://bundlephobia.com/package/@oxog/routely)

A micro-kernel router for React with a framework-agnostic core (~1.5KB) and React adapter (~2.5KB total).

## Features

- **Tiny** - Core ~1.5KB, React adapter ~2.5KB gzipped
- **Type-safe** - Full TypeScript with type inference
- **Extensible** - Plugin-based architecture
- **Zero deps** - No runtime dependencies

## Installation

```bash
npm install @oxog/routely
```

## Quick Start

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

[routely.oxog.dev](https://routely.oxog.dev)

## Structure

```
packages/
├── core/          # @oxog/routely-core
└── react/         # @oxog/routely
plugins/           # Optional plugins
examples/          # Examples
website/           # Docs site
mcp/               # MCP server
```

## Development

```bash
pnpm install       # Install dependencies
pnpm build         # Build all
pnpm test          # Run tests
pnpm typecheck     # Type check
```

## License

MIT © [Ersin Koç](https://github.com/ersinkoc)
