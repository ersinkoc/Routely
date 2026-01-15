/**
 * MCP Resources handlers
 */

export async function listResourcesHandler() {
  return {
    resources: [
      {
        uri: 'routely:///routes',
        name: 'All Routes',
        description: 'Complete list of all routes in the Routely application',
        mimeType: 'application/json',
      },
      {
        uri: 'routely:///schema',
        name: 'Route Schema',
        description: 'JSON schema for Routely route definitions',
        mimeType: 'application/json',
      },
    ],
  };
}

export async function readResourceHandler(uri: string) {
  if (uri === 'routely:///routes') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            title: 'Routely Route',
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The route path pattern (e.g., "/users/:id")',
              },
              component: {
                type: 'string',
                description: 'Path to the route component',
              },
              children: {
                type: 'array',
                description: 'Nested child routes',
                items: { $ref: '#' },
              },
              meta: {
                type: 'object',
                description: 'Additional route metadata',
              },
            },
            required: ['path'],
          },
        }),
      ],
    };
  }

  if (uri === 'routely:///schema') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            title: 'Routely Route',
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'The route path pattern',
              },
              component: {
                type: 'string',
                description: 'Component reference',
              },
              children: {
                type: 'array',
                items: { $ref: '#' },
              },
            },
            required: ['path'],
          }),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
}
