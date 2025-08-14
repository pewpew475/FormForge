// Vercel API handler
// This file exports the Express app for Vercel's serverless functions

export default async function handler(req, res) {
  try {
    // Dynamically import the app
    const { default: app } = await import('../dist/vercel.js');

    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
