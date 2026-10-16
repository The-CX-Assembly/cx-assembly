'use client';

import { finishUpload, startUpload } from '../controllers/media.actions';

export type UploadKind = 'video' | 'pdf' | 'image';

export interface UploadResult {
  path: string;
  /** Public URL (videos and images only; PDFs stay private). */
  url?: string;
  size: number;
}

/**
 * Uploads a file straight from the browser to Cloud Storage through a one-time
 * session opened by the server, reporting progress (0–1) as it goes.
 */
export async function uploadFile(
  siteId: string,
  kind: UploadKind,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  const started = await startUpload(siteId, {
    kind,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
  });
  if (!started.success) throw new Error(started.error);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', started.uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.send(file);
  });

  const finished = await finishUpload(siteId, { kind, path: started.path });
  if (!finished.success) throw new Error(finished.error);
  onProgress?.(1);
  return { path: finished.path, url: finished.url, size: finished.size };
}
