// Forms API endpoint for Vercel
import { getSupabase } from '../dist/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = getSupabase();

    if (req.method === 'GET') {
      // Get all forms
      const { data: forms, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      res.status(200).json(forms || []);
      
    } else if (req.method === 'POST') {
      // Create new form
      const formData = req.body;
      
      const { data: form, error } = await supabase
        .from('forms')
        .insert([{
          title: formData.title,
          description: formData.description,
          header_image: formData.headerImage,
          questions: formData.questions || [],
          is_published: formData.isPublished || false
        }])
        .select()
        .single();

      if (error) throw error;
      
      res.status(201).json(form);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Forms API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
