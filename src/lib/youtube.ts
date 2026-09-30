/** Convierte una URL de YouTube (watch, youtu.be, live) a su URL de embed. null si no se pudo parsear. */
export function getYoutubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  let videoId: string | null = null;
  if (parsed.hostname.includes("youtu.be")) {
    videoId = parsed.pathname.slice(1);
  } else if (parsed.hostname.includes("youtube.com")) {
    if (parsed.pathname === "/watch") videoId = parsed.searchParams.get("v");
    else if (parsed.pathname.startsWith("/embed/")) videoId = parsed.pathname.replace("/embed/", "");
    else if (parsed.pathname.startsWith("/live/")) videoId = parsed.pathname.replace("/live/", "");
  }

  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId.split("/")[0]}`;
}
