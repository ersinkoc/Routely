/**
 * List routes handler
 */

import { discoverRouteFiles, parseRoutesFromFile, findEntryPoint, formatRouteInfo, type DiscoveredRoutes } from '../discovery.js';

export async function listRoutesHandler(projectPath: string): Promise<{
  success: boolean;
  data?: DiscoveredRoutes;
  formatted?: string;
  error?: string;
}> {
  try {
    // Find route files
    const routeFiles = await discoverRouteFiles(projectPath);

    if (routeFiles.length === 0) {
      return {
        success: false,
        error: 'No route files found in the project. Make sure this is a Routely project.',
      };
    }

    // Parse routes from all files
    const allRoutes: any[] = [];
    
    for (const file of routeFiles) {
      const routes = await parseRoutesFromFile(file);
      allRoutes.push(...routes);
    }

    // Find entry point
    const entryPoint = await findEntryPoint(projectPath);

    // Format output
    const formatted = allRoutes.length > 0
      ? `# Routely Routes\n\nFound ${allRoutes.length} route${allRoutes.length !== 1 ? 's' : ''}:\n\n` +
        allRoutes.map(route => `- ${formatRouteInfo(route)}`).join('\n')
      : '# Routely Routes\n\nNo routes found.';

    return {
      success: true,
      data: {
        routes: allRoutes,
        entryPoint,
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
