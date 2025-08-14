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
    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get individual form
        const { data: forms, error } = await supabase
          .from('forms')
          .select('*')
          .eq('id', id);

        if (error) throw error;

        if (!forms || forms.length === 0) {
          return res.status(404).json({ error: 'Form not found' });
        }

        // Map snake_case to camelCase for frontend compatibility
        const mappedForm = {
          id: forms[0].id,
          title: forms[0].title,
          description: forms[0].description,
          headerImage: forms[0].header_image,
          questions: forms[0].questions || [],
          isPublished: forms[0].is_published,
          createdAt: forms[0].created_at,
          updatedAt: forms[0].updated_at
        };

        res.status(200).json(mappedForm);
      } else {
        // Get all forms
        const { data: forms, error } = await supabase
          .from('forms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase for frontend compatibility
        const mappedForms = (forms || []).map(form => ({
          id: form.id,
          title: form.title,
          description: form.description,
          headerImage: form.header_image,
          questions: form.questions || [],
          isPublished: form.is_published,
          createdAt: form.created_at,
          updatedAt: form.updated_at
        }));

        res.status(200).json(mappedForms);
      }
      
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

      // Map snake_case to camelCase for frontend compatibility
      const mappedForm = {
        id: form.id,
        title: form.title,
        description: form.description,
        headerImage: form.header_image,
        questions: form.questions || [],
        isPublished: form.is_published,
        createdAt: form.created_at,
        updatedAt: form.updated_at
      };

      res.status(201).json(mappedForm);

    } else if (req.method === 'PUT') {
      // Update form
      if (!id) {
        return res.status(400).json({ error: 'Form ID is required for updates' });
      }

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

      // Map snake_case to camelCase for frontend compatibility
      const mappedForm = {
        id: form.id,
        title: form.title,
        description: form.description,
        headerImage: form.header_image,
        questions: form.questions || [],
        isPublished: form.is_published,
        createdAt: form.created_at,
        updatedAt: form.updated_at
      };

      res.status(200).json(mappedForm);

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
