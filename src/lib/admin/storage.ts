import "server-only";
import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET as BUCKET } from "@/lib/storage-url";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"]);

function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

/** Sube un archivo al bucket público `media` y devuelve su URL pública. Sin auth de por medio
 * (usa la service_role key server-side): el permiso real lo valida el caller antes de llamar. */
export async function uploadFile(file: File, folder: string): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.has(file.type)) return { error: `Tipo de archivo no soportado (${file.type || "desconocido"}). Usá jpg, png, webp, gif, mp4 o webm.` };

  const maxBytes = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) return { error: `Archivo muy grande (máx ${Math.round(maxBytes / 1024 / 1024)}MB).` };

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabaseAdmin().storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: `No se pudo subir el archivo: ${error.message}` };

  const { data } = supabaseAdmin().storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
