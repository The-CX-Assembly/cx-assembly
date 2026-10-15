'use client';

import { useState } from 'react';
import type { Video } from '@/types';
import { embedUrl } from '@/features/media/embed';
import styles from './media.module.css';

/**
 * Click-to-play videos: until a visitor presses play, only a thumbnail loads, so
 * YouTube/Vimeo scripts (and their tracking) don't slow the page down.
 */
function VideoPlayer({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const iframeSrc = embedUrl(video);

  if (playing) {
    return (
      <div className={styles.player}>
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video src={video.source} poster={video.thumbnailUrl} controls autoPlay playsInline />
        )}
      </div>
    );
  }

  return (
    <div className={styles.player}>
      <button type="button" className={styles.poster} onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title}`}>
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" loading="lazy" />
        ) : video.provider === 'upload' ? (
          <video src={`${video.source}#t=0.5`} preload="metadata" muted playsInline aria-hidden="true" />
        ) : null}
        <span className={styles.play} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
      </button>
    </div>
  );
}

export default function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <ul className={styles.grid}>
      {videos.map((video) => (
        <li key={video.id} className={styles.card}>
          <VideoPlayer video={video} />
          <h3 className={styles.title}>{video.title}</h3>
          {video.description && <p className={styles.description}>{video.description}</p>}
        </li>
      ))}
    </ul>
  );
}
