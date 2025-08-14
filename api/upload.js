// Upload API endpoint for Vercel
import { getSupabase } from '../dist/supabase.js';

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
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', req.body ? Object.keys(req.body) : 'no body');

    // Frontend sends: { file: base64Data, fileName: file.name }
    const { file, fileName } = req.body || {};

    console.log('Extracted data:', {
      hasFile: !!file,
      fileType: typeof file,
      fileLength: file ? file.length : 0,
      fileName
    });

    if (!file || !fileName) {
      console.error('Missing required fields:', { hasFile: !!file, hasFileName: !!fileName });
      res.status(400).json({
        error: 'File and fileName are required',
        received: { hasFile: !!file, hasFileName: !!fileName }
      });
      return;
    }

    const supabase = getSupabase();
    const bucketName = 'form-images';

    // Convert base64 to buffer (frontend sends just base64 data without data: prefix)
    let buffer;
    try {
      buffer = Buffer.from(file, 'base64');
      console.log('Buffer created, size:', buffer.length);
    } catch (err) {
      console.error('Error creating buffer:', err);
      res.status(400).json({ error: 'Invalid base64 image data' });
      return;
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${fileName}`;
    console.log('Uploading to bucket:', bucketName, 'filename:', uniqueFilename);

    // Detect content type from filename extension
    let contentType = 'image/jpeg'; // default
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

    console.log('Detected content type:', contentType);

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

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFilename);

    console.log('Upload successful, public URL:', publicUrl);

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
