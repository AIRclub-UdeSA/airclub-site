/** Devuelve una URL absoluta: si falta el protocolo (ej.: "www.linkedin.com/in/...") le agrega https://. */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;
}
