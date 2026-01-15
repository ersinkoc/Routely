/**
 * Route discovery utilities for Routely MCP Server
 */

import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { resolve, join } from 'path';

export interface RouteDefinition {
  path: string;
  component?: string;
  children?: RouteDefinition[];
  meta?: Record<string, unknown>;
}

export interface DiscoveredRoutes {
  routes: RouteDefinition[];
  entryPoint: string;
}

/**
 * Discover route files in a Routely project
 */
export async function discoverRouteFiles(projectPath: string): Promise<string[]> {
  const patterns = [
    '**/src/**/*routes*.{ts,tsx,js,jsx}',
    '**/src/**/router*.{ts,tsx,js,jsx}',
    '**/src/main.{ts,tsx,js,jsx}',
    '**/src/app.{ts,tsx,js,jsx}',
    '**/src/index.{ts,tsx,js,jsx}',
  ];

  const files = await glob(patterns, {
    cwd: projectPath,
    absolute: false,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  });

  return files.map(file => join(projectPath, file));
}

/**
 * Parse route definitions from source code
 */
export async function parseRoutesFromFile(filePath: string): Promise<RouteDefinition[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseRoutesFromContent(content);
  } catch {
    return [];
  }
}

/**
 * Parse routes from file content
 */
export function parseRoutesFromContent(content: string): RouteDefinition[] {
  const routes: RouteDefinition[] = [];

  // Match route() calls
  const routeRegex = /route\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\)/g;
  const createRouterRegex = /createRouter\s*\(\s*\{\s*routes:\s*(\[.*?\])/s;

  let match;

  // Extract routes array if using createRouter
  const routerMatch = content.match(createRouterRegex);
  if (routerMatch) {
    // Try to parse the routes array
    const routesContent = routerMatch[1];
    
    // Find all route() calls in the array
    while ((match = routeRegex.exec(routesContent)) !== null) {
      const [, path, component] = match;
      
      routes.push({
        path,
        component: extractComponentPath(component),
      });
    }
  } else {
    // Search for route() calls throughout the file
    while ((match = routeRegex.exec(content)) !== null) {
      const [, path, component] = match;
      
      routes.push({
        path,
        component: extractComponentPath(component),
      });
    }
  }

  // Look for nested routes (children arrays)
  const nestedRouteRegex = /children:\s*\[(.*?)\]/gs;
  let nestedMatch;
  while ((nestedMatch = nestedRouteRegex.exec(content)) !== null) {
    const childrenContent = nestedMatch[1];
    while ((match = routeRegex.exec(childrenContent)) !== null) {
      const [, path, component] = match;
      routes.push({
        path,
        component: extractComponentPath(component),
      });
    }
  }

  return routes;
}

/**
 * Extract component path from import() or require()
 */
function extractComponentPath(componentRef: string): string | undefined {
  // Match import() calls
  const importMatch = componentRef.match(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  if (importMatch) {
    return importMatch[1];
  }

  // Match require() calls
  const requireMatch = componentRef.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  if (requireMatch) {
    return requireMatch[1];
  }

  // Match direct component references
  const directMatch = componentRef.match(/(\w+)/);
  if (directMatch) {
    return directMatch[1];
  }

  return undefined;
}

/**
 * Find the entry point file (main.tsx, app.tsx, etc.)
 */
export async function findEntryPoint(projectPath: string): Promise<string> {
  const entryFiles = [
    'src/main.tsx',
    'src/main.ts',
    'src/app.tsx',
    'src/app.ts',
    'src/index.tsx',
    'src/index.ts',
  ];

  for (const file of entryFiles) {
    const fullPath = resolve(projectPath, file);
    try {
      await readFile(fullPath, 'utf-8');
      return file;
    } catch {
      // File doesn't exist, continue
    }
  }

  return 'src/main.tsx'; // Default
}

/**
 * Get route parameters from path
 */
export function extractRouteParams(path: string): string[] {
  const params: string[] = [];
  const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  
  let match;
  while ((match = paramRegex.exec(path)) !== null) {
    params.push(match[1]);
  }
  
  return params;
}

/**
 * Format route information for display
 */
export function formatRouteInfo(route: RouteDefinition): string {
  const params = extractRouteParams(route.path);
  const parts = [`\`${route.path}\``];
  
  if (params.length > 0) {
    parts.push(`Parameters: ${params.map(p => `\`${p}\``).join(', ')}`);
  }
  
  if (route.component) {
    parts.push(`Component: \`${route.component}\``);
  }
  
  return parts.join(' | ');
}
