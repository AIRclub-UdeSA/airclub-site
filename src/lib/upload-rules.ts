// Compartido entre el form (valida al elegir el archivo, antes de subir nada) y el servidor (valida
// de nuevo al firmar la URL de subida: lo que diga el cliente no alcanza).

const MB = 1024 * 1024;

export const MAX_IMAGE_BYTES = 8 * MB;
// El plan gratis de Supabase no acepta archivos de más de 50MB.
export const MAX_VIDEO_BYTES = 50 * MB;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** null si el archivo se puede subir; si no, el mensaje de error para mostrar. */
export function uploadError(file: { type: string; size: number }): string | null {
  if (!(file.type in EXTENSIONS)) {
    return `Tipo de archivo no soportado (${file.type || "desconocido"}). Usá jpg, png, webp, gif, mp4 o webm.`;
  }
  const maxBytes = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) return `Archivo muy grande (máx ${maxBytes / MB}MB).`;
  return null;
}

export function extensionFor(type: string): string {
  return EXTENSIONS[type] ?? "bin";
}

// Un archivo elegido pero todavía no subido se guarda en el form como este marcador; al guardar,
// se sube y el marcador se reemplaza por la URL pública. Nunca debería llegar a la base.
export const PENDING_PREFIX = "pending:";

export function isPendingUpload(value: string): boolean {
  return value.startsWith(PENDING_PREFIX);
}
