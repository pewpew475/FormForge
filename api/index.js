// Vercel API handler
// This file exports the Express app for Vercel's serverless functions

const { default: app } = await import('../dist/vercel.js');

export default app;
