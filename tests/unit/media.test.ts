import { describe, expect, it } from 'vitest';
import { embedUrl, formatBytes, parseVideoUrl } from '@/modules/media/utils/embed';

describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('reads YouTube link %s', (url, id) => {
    expect(parseVideoUrl(url)).toEqual({ provider: 'youtube', id });
  });

  it.each([
    ['https://vimeo.com/76979871', '76979871'],
    ['https://vimeo.com/channels/staffpicks/76979871', '76979871'],
    ['https://player.vimeo.com/video/76979871?h=abc', '76979871'],
  ])('reads Vimeo link %s', (url, id) => {
    expect(parseVideoUrl(url)).toEqual({ provider: 'vimeo', id });
  });

  it.each(['not a url', 'https://example.com/video.mp4', 'https://www.youtube.com/watch?v=short', 'https://vimeo.com/about'])(
    'rejects %s',
    (url) => {
      expect(parseVideoUrl(url)).toBeNull();
    },
  );
});

describe('embedUrl', () => {
  it('uses the privacy-enhanced YouTube player', () => {
    expect(embedUrl({ provider: 'youtube', source: 'dQw4w9WgXcQ' })).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    );
  });

  it('has no iframe for uploaded files', () => {
    expect(embedUrl({ provider: 'upload', source: 'https://x/video.mp4' })).toBeNull();
  });
});

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(900)).toBe('900 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(3.5 * 1024 * 1024)).toBe('3.5 MB');
    expect(formatBytes(120 * 1024 * 1024)).toBe('120 MB');
  });
});
