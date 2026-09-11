import { createClient } from '@supabase/supabase-js';

// Read credentials from environment variables, with safe fallback and trailing slash trimming
const rawUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  ''
).trim();

const envSupabaseUrl = rawUrl.replace(/\/+$/, '');

const envSupabaseAnonKey = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ''
).trim();

// Check if user has provided a real Supabase URL
export const isSupabaseConfigured = Boolean(
  envSupabaseUrl &&
  envSupabaseAnonKey &&
  !envSupabaseUrl.includes('your-project-ref') &&
  envSupabaseUrl.startsWith('https://')
);

// Fallback URL for dummy client initialization if not configured yet
export const supabaseUrl = isSupabaseConfigured ? envSupabaseUrl : 'https://placeholder-project.supabase.co';
export const supabaseAnonKey = isSupabaseConfigured ? envSupabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Upload a file or base64 data to Supabase Storage bucket 'product-images'
 * and return the public URL.
 */
export async function uploadProductImage(
  fileOrBase64: File | string,
  fileNamePrefix: string = 'prod'
): Promise<string> {
  if (!isSupabaseConfigured) {
    // If Supabase is not connected yet, return as-is (data url or existing url)
    if (typeof fileOrBase64 === 'string') return fileOrBase64;
    return URL.createObjectURL(fileOrBase64);
  }

  try {
    let fileBody: Blob | File;
    let extension = 'jpg';

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
        // Already a remote URL
        return fileOrBase64;
      }
      // Convert base64 data URL to Blob
      const [header, base64Data] = fileOrBase64.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      extension = mime.split('/')[1] || 'jpg';
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      fileBody = new Blob([bytes], { type: mime });
    } else {
      fileBody = fileOrBase64;
      const nameParts = fileOrBase64.name.split('.');
      extension = nameParts[nameParts.length - 1] || 'jpg';
    }

    const uniquePath = `products/${fileNamePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(uniquePath, fileBody, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase:', err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
  }
}
