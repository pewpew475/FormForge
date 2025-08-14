// Individual form API endpoint for Vercel
import { getSupabase } from '../../dist/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = getSupabase();
    const { id } = req.query;

    if (req.method === 'GET') {
      // Get individual form
      const { data: form, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Form not found' });
        }
        throw error;
      }
      
      res.status(200).json(form);

    } else if (req.method === 'PUT') {
      // Update form
      const formData = req.body;
      
      const { data: form, error } = await supabase
        .from('forms')
        .update({
          title: formData.title,
          description: formData.description,
          header_image: formData.headerImage,
          questions: formData.questions || [],
          is_published: formData.isPublished || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Form not found' });
        }
        throw error;
      }
      
      res.status(200).json(form);

    } else if (req.method === 'DELETE') {
      // Delete form
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      res.status(200).json({ message: 'Form deleted successfully' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Form API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
