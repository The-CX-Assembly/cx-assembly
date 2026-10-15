// Shared by server and client: turns pasted YouTube / Vimeo links into
// embeddable players and thumbnails.

import type { Video } from '@/types';

export type ParsedLink = { provider: 'youtube' | 'vimeo'; id: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{5,12}$/;

/** Recognises youtube.com/watch, youtu.be, /shorts, /embed, /live and vimeo.com links. */
export function parseVideoUrl(raw: string): ParsedLink | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    const id = parts[0];
    return id && YOUTUBE_ID.test(id) ? { provider: 'youtube', id } : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
    const id = url.searchParams.get('v') ?? (['shorts', 'embed', 'live', 'v'].includes(parts[0]) ? parts[1] : undefined);
    return id && YOUTUBE_ID.test(id) ? { provider: 'youtube', id } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find((p) => VIMEO_ID.test(p));
    return id ? { provider: 'vimeo', id } : null;
  }
  return null;
}

/** Player URL for an iframe (YouTube's privacy-enhanced domain; starts on click). */
export function embedUrl(video: Pick<Video, 'provider' | 'source'>): string | null {
  if (video.provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${video.source}?autoplay=1&rel=0`;
  if (video.provider === 'vimeo') return `https://player.vimeo.com/video/${video.source}?autoplay=1&dnt=1`;
  return null;
}

/** A thumbnail that needs no API call (YouTube only; Vimeo's is looked up when saving). */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
