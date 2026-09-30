// Compartido entre next.config.ts, el servidor y el cliente: sin imports de server-only.

export const STORAGE_BUCKET = "media";

/** Prefijo de las URLs públicas del bucket de Storage (ej. `https://<ref>.supabase.co/storage/v1/object/public/media/`). */
export function storagePublicPrefix(supabaseUrl: string | undefined): string | null {
  if (!supabaseUrl) return null;
  try {
    return `${new URL(supabaseUrl).origin}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  } catch {
    return null;
  }
}

/** true si `next/image` puede mostrar esta URL: archivo propio del sitio (`/…`) o subido a nuestro bucket.
 * Cualquier otro host no está en images.remotePatterns y se ve roto en el sitio público. */
export function isSiteImageUrl(url: string, prefix: string | null): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  return !!prefix && trimmed.startsWith(prefix);
}
