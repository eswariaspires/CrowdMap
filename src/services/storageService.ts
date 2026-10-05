import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BUCKET = 'location-images';

/**
 * Uploads an image to Supabase Storage and returns its public URL.
 * Falls back to a base64 DataURL if Supabase is not configured or the upload fails.
 */
export async function uploadImageToStorage(file: File, pathFolder: string = 'locations'): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${pathFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch (err) {
      console.warn('Supabase Storage upload failed, falling back to base64 DataURL:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
