# Routely MCP Server

[Model Context Protocol](https://modelcontextprotocol.io) server for Routely router.

Enables AI assistants (like Claude) to discover routes, navigate, and interact with Routely-based applications.

## Installation

```bash
npm install @oxog/routely-mcp-server
```

## Usage

### As an MCP Server

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "routely": {
      "command": "npx",
      "args": ["@oxog/routely-mcp-server", "/path/to/your/project"]
    }
  }
}
```

### Available Tools

#### `list_routes`

List all routes in the Routely application.

**Parameters:**
- `projectPath` (string): Path to the project directory

**Returns:** Array of route definitions with paths, components, and metadata

#### `get_route_details`

Get detailed information about a specific route.

**Parameters:**
- `projectPath` (string): Path to the project directory
- `routePath` (string): The route path to get details for

**Returns:** Detailed route information including component source, parameters, and nested routes

#### `navigate`

Navigate to a specific route (runtime only).

**Parameters:**
- `routePath` (string): The route path to navigate to
- `params` (object, optional): Route parameters

**Returns:** Navigation result

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run
npm start
```

## License

MIT
