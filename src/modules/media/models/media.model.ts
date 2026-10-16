/** Where a video plays from. */
export type VideoProvider = 'youtube' | 'vimeo' | 'upload';

export interface Video {
  id: string;
  title: string;
  description?: string;
  provider: VideoProvider;
  /** YouTube/Vimeo video id, or the public URL of an uploaded file. */
  source: string;
  /** The link as pasted, for editing (links only). */
  originalUrl?: string;
  thumbnailUrl?: string;
  /** Storage path of an uploaded file, so it can be deleted with the video. */
  storagePath?: string;
  /** Off until turned on in the admin: nothing is public by default. */
  published: boolean;
  showOnHome: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

/** A downloadable PDF. Visitors always fill in a form first (and become a lead). */
export interface Resource {
  id: string;
  title: string;
  description?: string;
  /** Private Storage path; the file is only ever served through a short-lived link. */
  storagePath: string;
  fileName: string;
  fileSize: number;
  coverUrl?: string;
  published: boolean;
  order: number;
  downloads?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Master switches for the website's video and PDF sections. All off by default. */
export interface MediaSettings {
  videosOnHome: boolean;
  videosPage: boolean;
  videosTitle: string;
  videosIntro: string;
  resourcesPage: boolean;
  resourcesTitle: string;
  resourcesIntro: string;
}
