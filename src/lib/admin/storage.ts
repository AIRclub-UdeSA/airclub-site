import "server-only";
import { createClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET as BUCKET, storagePublicPrefix } from "@/lib/storage-url";
import { extensionFor, uploadError } from "@/lib/upload-rules";

function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export type SignedUpload = { signedUrl: string; publicUrl: string };

/** Firma una URL para que el navegador suba un archivo directo al bucket público `media`, sin pasar
 * por Vercel (que corta los requests en 4.5MB). Usa la service_role key server-side: el permiso real
 * lo valida el caller antes de llamar. La URL firmada vence a las 2hs. */
export async function signUpload(file: { type: string; size: number }, folder: string): Promise<SignedUpload | { error: string }> {
  const invalid = uploadError(file);
  if (invalid) return { error: invalid };

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file.type)}`;
  const bucket = supabaseAdmin().storage.from(BUCKET);

  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error) return { error: `No se pudo preparar la subida: ${error.message}` };

  return { signedUrl: data.signedUrl, publicUrl: bucket.getPublicUrl(path).data.publicUrl };
}

/** Borra del bucket los archivos de estas URLs públicas. Ignora las que no son de nuestro bucket
 * (ej. /talks/... en public/). Nunca tira: un archivo que no se pudo borrar solo ocupa espacio,
 * y eso no justifica hacer fallar el guardado que lo llamó. */
export async function removeStorageFiles(urls: string[]): Promise<void> {
  const prefix = storagePublicPrefix(process.env.SUPABASE_URL);
  if (!prefix) return;

  const paths = urls.filter((url) => url.startsWith(prefix)).map((url) => decodeURIComponent(url.slice(prefix.length)));
  if (paths.length === 0) return;

  try {
    const { error } = await supabaseAdmin().storage.from(BUCKET).remove(paths);
    if (error) console.error("No se pudieron borrar archivos de Storage:", paths, error.message);
  } catch (err) {
    console.error("No se pudieron borrar archivos de Storage:", paths, err);
  }
}
