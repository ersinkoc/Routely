#!/usr/bin/env node

/**
 * MCP Server CLI
 * 
 * Command-line interface for running the Routely MCP server.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from './index.js';

// Allow passing project path as argument
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: routely-mcp <project-path>');
  console.error('');
  console.error('Arguments:');
  console.error('  project-path  Path to the Routely project directory');
  process.exit(1);
}

const projectPath = args[0];

// Store project path for use in handlers
(globalThis as any).__ROUTELY_PROJECT_PATH = projectPath;

console.error(`Routely MCP Server starting for project: ${projectPath}`);

// The server is already started in index.ts
// This file is just for CLI entry point
