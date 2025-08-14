// Health check endpoint for Vercel
import { getSupabase } from '../dist/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check database connection using Supabase client
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('forms')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({ 
      status: "unhealthy", 
      timestamp: new Date().toISOString(),
      error: "Database connection failed"
    });
  }
}
