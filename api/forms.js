// Forms API endpoint for Vercel
import { getSupabase } from '../dist/supabase.js';

// Authentication helper for Vercel API routes
async function authenticateUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const supabase = getSupabase();

  try {
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

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

    // Authenticate user for all operations except individual form GET (for form filling)
    const user = await authenticateUser(req);
    const requiresAuth = req.method !== 'GET' || !id; // GET individual form doesn't require auth for form filling

    if (requiresAuth && !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

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
        // Get all forms - filter by user if authenticated
        let query = supabase
          .from('forms')
          .select('*');

        // Filter by user if authenticated
        if (user) {
          query = query.eq('user_id', user.id);
        }

        const { data: forms, error } = await query.order('created_at', { ascending: false });

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
          updatedAt: form.updated_at,
          userId: form.user_id
        }));

        res.status(200).json(mappedForms);
      }
      
    } else if (req.method === 'POST') {
      // Create new form - requires authentication
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to create forms' });
      }

      const formData = req.body;

      const { data: form, error } = await supabase
        .from('forms')
        .insert([{
          title: formData.title,
          description: formData.description,
          header_image: formData.headerImage,
          questions: formData.questions || [],
          is_published: formData.isPublished || false,
          user_id: user.id
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
        updatedAt: form.updated_at,
        userId: form.user_id
      };

      res.status(201).json(mappedForm);

    } else if (req.method === 'PUT') {
      // Update form - requires authentication
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to update forms' });
      }

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
        .eq('user_id', user.id) // Ensure user owns the form
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Form not found or you do not have permission to update it' });
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
        updatedAt: form.updated_at,
        userId: form.user_id
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
