/**
 * Routely MCP Server
 * 
 * Model Context Protocol server for Routely router.
 * Enables AI assistants to discover and navigate routes in Routely applications.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { listRoutesHandler, getRouteDetailsHandler, navigateHandler } from './handlers/index.js';
import { listResourcesHandler, readResourceHandler } from './handlers/resources.js';

// Create MCP server
const server = new Server(
  {
    name: 'routely-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool schemas
const ListRoutesSchema = z.object({
  projectPath: z.string().describe('Path to the Routely project directory'),
});

const GetRouteDetailsSchema = z.object({
  projectPath: z.string().describe('Path to the Routely project directory'),
  routePath: z.string().describe('The route path to get details for (e.g., "/users/:id")'),
});

const NavigateSchema = z.object({
  routePath: z.string().describe('The route path to navigate to'),
  params: z.record(z.string()).optional().describe('Route parameters'),
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_routes',
        description: 'List all routes in a Routely application. Discovers route definitions from the codebase.',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the Routely project directory',
            },
          },
          required: ['projectPath'],
        } as const,
      },
      {
        name: 'get_route_details',
        description: 'Get detailed information about a specific route, including component source code and parameters.',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the Routely project directory',
            },
            routePath: {
              type: 'string',
              description: 'The route path to get details for (e.g., "/users/:id")',
            },
          },
          required: ['projectPath', 'routePath'],
        } as const,
      },
      {
        name: 'navigate',
        description: 'Navigate to a specific route. Only works during runtime with browser context.',
        inputSchema: {
          type: 'object',
          properties: {
            routePath: {
              type: 'string',
              description: 'The route path to navigate to',
            },
            params: {
              type: 'object',
              description: 'Route parameters for dynamic segments',
              additionalProperties: {
                type: 'string',
              },
            },
          },
          required: ['routePath'],
        } as const,
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_routes': {
        const { projectPath } = ListRoutesSchema.parse(args);
        const result = await listRoutesHandler(projectPath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_route_details': {
        const { projectPath, routePath } = GetRouteDetailsSchema.parse(args);
        const result = await getRouteDetailsHandler(projectPath, routePath);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'navigate': {
        const { routePath, params } = NavigateSchema.parse(args);
        const result = await navigateHandler(routePath, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
});

// Register resources
server.setRequestHandler({ method: 'resources/list' }, async () => {
  return listResourcesHandler();
});

server.setRequestHandler({ method: 'resources/read' }, async (request) => {
  return readResourceHandler(request.params.uri);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Routely MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
