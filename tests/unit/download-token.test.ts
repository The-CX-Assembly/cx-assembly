import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDownloadToken, verifyDownloadToken } from '@/modules/media/services/media.service';

const NOW = Date.UTC(2026, 9, 15, 12);

beforeEach(() => vi.stubEnv('ADMIN_SESSION_SECRET', 'test-secret-that-is-at-least-32-characters-long'));
afterEach(() => vi.unstubAllEnvs());

describe('PDF download links', () => {
  it('grant one PDF on one site', () => {
    const token = createDownloadToken('cx-assembly', 'pdf-1', NOW)!;
    expect(verifyDownloadToken(token, NOW)).toEqual({ siteId: 'cx-assembly', resourceId: 'pdf-1' });
  });

  it('expire after 15 minutes', () => {
    const token = createDownloadToken('cx-assembly', 'pdf-1', NOW)!;
    expect(verifyDownloadToken(token, NOW + 14 * 60_000)).not.toBeNull();
    expect(verifyDownloadToken(token, NOW + 16 * 60_000)).toBeNull();
  });

  it('reject edited tokens', () => {
    const token = createDownloadToken('cx-assembly', 'pdf-1', NOW)!;
    const [, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ s: 'cx-assembly', r: 'pdf-2', e: NOW / 1000 + 900 })).toString('base64url');
    expect(verifyDownloadToken(`${forged}.${sig}`, NOW)).toBeNull();
    expect(verifyDownloadToken('garbage', NOW)).toBeNull();
  });

  it('reject tokens signed with another secret', () => {
    const token = createDownloadToken('cx-assembly', 'pdf-1', NOW)!;
    vi.stubEnv('ADMIN_SESSION_SECRET', 'a-completely-different-secret-of-32-plus-chars');
    expect(verifyDownloadToken(token, NOW)).toBeNull();
  });

  it('are disabled without a strong secret', () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'short');
    expect(createDownloadToken('cx-assembly', 'pdf-1', NOW)).toBeNull();
  });
});
