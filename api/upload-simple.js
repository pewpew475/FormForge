// Simple upload API endpoint for Vercel
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Upload request received');
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Initialize Supabase client directly
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { file, fileName } = req.body || {};

    console.log('Request data:', {
      hasFile: !!file,
      fileType: typeof file,
      fileLength: file ? file.length : 0,
      fileName
    });

    if (!file || !fileName) {
      console.error('Missing required fields');
      res.status(400).json({
        error: 'File and fileName are required',
        received: { hasFile: !!file, hasFileName: !!fileName }
      });
      return;
    }

    const bucketName = 'form-images';
    
    // Convert base64 to buffer (frontend sends just base64 data)
    const buffer = Buffer.from(file, 'base64');

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${fileName}`;

    // Detect content type from filename extension
    let contentType = 'image/jpeg';
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'png') {
      contentType = 'image/png';
    } else if (extension === 'gif') {
      contentType = 'image/gif';
    } else if (extension === 'webp') {
      contentType = 'image/webp';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      contentType = 'image/jpeg';
    }
    
    console.log('Uploading:', { bucketName, uniqueFilename, contentType, bufferSize: buffer.length });
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFilename, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      res.status(400).json({ 
        error: 'Storage upload failed',
        message: error.message,
        details: error
      });
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFilename);

    console.log('Upload successful:', { publicUrl, filename: uniqueFilename });

    res.status(200).json({ 
      url: publicUrl,
      filename: uniqueFilename 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message,
      stack: error.stack
    });
  }
}
