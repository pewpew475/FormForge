#!/usr/bin/env node

// Script to generate database migrations
// This sets a temporary DATABASE_URL for migration generation

process.env.DATABASE_URL = 'postgresql://temp:temp@localhost:5432/temp';

import { execSync } from 'child_process';

try {
  console.log('Generating database migration...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  console.log('Migration generated successfully!');
} catch (error) {
  console.error('Failed to generate migration:', error.message);
  process.exit(1);
}
