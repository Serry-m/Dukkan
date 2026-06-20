// Client-side guards for image uploads. The file input's accept="image/*"
// is only a hint — these run before we hand the file to Supabase Storage,
// which is the actual point a user (an authenticated owner) controls.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

// Returns an Arabic error message if the file is not an acceptable image, else null.
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES[file.type]) {
    return 'صيغة الصورة غير مدعومة — استخدم JPG أو PNG أو WEBP'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'حجم الصورة كبير جداً — الحد الأقصى ٥ ميجابايت'
  }
  return null
}

// Derive the extension from the verified mime type — never trust the original
// filename (avoids an attacker-controlled extension in the storage path).
export function safeImageExt(file: File): string {
  return ALLOWED_TYPES[file.type] ?? 'jpg'
}
