export type MediaItem = {
  type: "IMAGE" | "VIDEO";
  src: string;
  poster: string;
  lightBg?: boolean;
  objectFit?: "contain" | "cover";
};
export type SlideItem = { title: string; embedUrl: string; openUrl: string };
export type LinkItem = { label: string; url: string };
