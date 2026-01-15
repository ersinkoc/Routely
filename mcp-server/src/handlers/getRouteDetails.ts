/**
 * Get route details handler
 */

import { discoverRouteFiles, parseRoutesFromFile, extractRouteParams } from '../discovery.js';
import { readFile } from 'fs/promises';

export async function getRouteDetailsHandler(
  projectPath: string,
  routePath: string
): Promise<{
  success: boolean;
  data?: any;
  formatted?: string;
  error?: string;
}> {
  try {
    // Find and parse routes
    const routeFiles = await discoverRouteFiles(projectPath);
    let targetRoute: any = null;
    let sourceFile: string | null = null;

    for (const file of routeFiles) {
      const routes = await parseRoutesFromFile(file);
      const found = routes.find(r => r.path === routePath);
      
      if (found) {
        targetRoute = found;
        sourceFile = file;
        break;
      }
    }

    if (!targetRoute) {
      return {
        success: false,
        error: `Route "${routePath}" not found`,
      };
    }

    // Extract route parameters
    const params = extractRouteParams(routePath);

    // Try to read component source
    let componentSource: string | undefined;
    if (targetRoute.component && sourceFile) {
      try {
        // Resolve component path relative to source file
        const componentPath = targetRoute.component.replace(/^\.\//, '');
        const fullComponentPath = require('path').resolve(
          require('path').dirname(sourceFile),
          componentPath
        );
        
        componentSource = await readFile(fullComponentPath + '.tsx', 'utf-8')
          .catch(() => readFile(fullComponentPath + '.ts', 'utf-8'))
          .catch(() => readFile(fullComponentPath + '.jsx', 'utf-8'))
          .catch(() => readFile(fullComponentPath + '.js', 'utf-8'))
          .catch(() => undefined);
      } catch {
        // Component file not found or unreadable
      }
    }

    // Format output
    const formatted = `# Route Details: ${routePath}\n\n` +
      `**Path:** \`${routePath}\`\n\n` +
      `**Component:** \`${targetRoute.component || 'N/A'}\`\n\n` +
      (params.length > 0 ? `**Parameters:**\n${params.map(p => `- \`${p}\``).join('\n')}\n\n` : '') +
      (componentSource ? `**Component Source:**\n\n\`\`\`typescript\n${componentSource.split('\n').slice(0, 30).join('\n')}${componentSource.split('\n').length > 30 ? '\n// ... (truncated)' : ''}\n\`\`\`` : '');

    return {
      success: true,
      data: {
        route: targetRoute,
        params,
        componentSource: componentSource ? componentSource.substring(0, 2000) : undefined,
      },
      formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
