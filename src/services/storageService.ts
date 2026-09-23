import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../lib/firebase';

/**
 * Uploads an image file to Firebase Storage.
 * Falls back to DataURL encoding when Firebase Storage is not configured.
 */
export async function uploadImageToStorage(file: File, pathFolder: string = 'locations'): Promise<string> {
  if (isFirebaseConfigured && storage && storage.app) {
    try {
      const fileExt = file.name.split('.').pop();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const storageRef = ref(storage, `${pathFolder}/${filename}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.warn('Firebase Storage upload failed, falling back to base64 DataURL:', err);
    }
  }

  // Fallback: Read file as Data URL for local demo persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
